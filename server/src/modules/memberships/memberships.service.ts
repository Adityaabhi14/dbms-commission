import { db } from '../../database/repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { addCalendarMonths, calculateRemainingDays, computeRenewalDates, toISODateOnly } from '../../utils/dateUtils';
import { CreateMembershipDto, RenewMembershipDto } from './memberships.schema';
import { AuthenticatedUserPayload } from '../../middleware/auth.middleware';

export class MembershipsService {
  public async getMemberships(filter: { memberId?: string }, currentUser: AuthenticatedUserPayload) {
    let targetMemberId = filter.memberId;

    // Client Isolation: ordinary clients can ONLY view their own memberships
    if (currentUser.role === 'CLIENT') {
      targetMemberId = currentUser.memberId;
      if (!targetMemberId) {
        throw new ForbiddenError('Client account is not linked to a member ID');
      }
    }

    const memberships = await db.memberships.findMany(targetMemberId ? { memberId: targetMemberId } : undefined);

    // Enrich with dynamic days remaining and plan details
    return memberships.map(m => ({
      ...m,
      daysRemaining: calculateRemainingDays(m.expiryDate)
    }));
  }

  public async getMembershipById(id: string, currentUser: AuthenticatedUserPayload) {
    const membership = await db.memberships.findUnique(id);
    if (!membership) {
      throw new NotFoundError('Membership', id);
    }

    if (currentUser.role === 'CLIENT' && currentUser.memberId !== membership.memberId) {
      throw new ForbiddenError('Access to other members’ subscriptions is prohibited');
    }

    return {
      ...membership,
      daysRemaining: calculateRemainingDays(membership.expiryDate)
    };
  }

  public async getRemainingDays(id: string, currentUser: AuthenticatedUserPayload) {
    const membership = await this.getMembershipById(id, currentUser);
    const daysRemaining = calculateRemainingDays(membership.expiryDate);

    return {
      membershipId: membership.id,
      memberId: membership.memberId,
      expiryDate: membership.expiryDate,
      daysRemaining,
      isExpired: daysRemaining < 0,
      isExpiringSoon: daysRemaining >= 0 && daysRemaining <= 15
    };
  }

  public async createMembership(dto: CreateMembershipDto, currentUser: AuthenticatedUserPayload) {
    // If client is creating, ensure they only create for themselves
    if (currentUser.role === 'CLIENT' && currentUser.memberId && currentUser.memberId !== dto.memberId) {
      throw new ForbiddenError('Cannot create membership for another student');
    }

    const member = await db.members.findUnique(dto.memberId);
    if (!member) {
      throw new NotFoundError('Member', dto.memberId);
    }

    const instrument = await db.instruments.findUnique(dto.instrumentId);
    if (!instrument) {
      throw new NotFoundError('Instrument', dto.instrumentId);
    }

    const branch = await db.branches.findUnique(dto.branchId);
    if (!branch) {
      throw new NotFoundError('Branch', dto.branchId);
    }

    // Verify instrument availability at this branch
    if (!branch.availableInstruments.includes(dto.instrumentId)) {
      throw new BadRequestError(`Instrument '${instrument.name}' is not offered at ${branch.name} Campus.`);
    }

    const plan = await db.plans.findUnique(dto.planId);
    if (!plan) {
      throw new NotFoundError('MembershipPlan', dto.planId);
    }

    // Pricing calculation
    const rawSubtotal = instrument.startingPricePerMonth * plan.durationMonths;
    const discountAmount = Math.round(rawSubtotal * (plan.discountPercentage / 100));
    const payableAmount = rawSubtotal - discountAmount;

    // Calendar-month calculation (NOT 30-day assumption!)
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const expiryDate = addCalendarMonths(startDate, plan.durationMonths);

    // Execute in transaction
    return await db.runInTransaction(async tx => {
      const createdMembership = await tx.memberships.create({
        memberId: dto.memberId,
        planId: dto.planId,
        instrumentId: dto.instrumentId,
        branchId: dto.branchId,
        startDate: toISODateOnly(startDate),
        expiryDate: toISODateOnly(expiryDate),
        status: 'ACTIVE',
        paymentStatus: 'COLLECTED',
        totalFee: rawSubtotal,
        discountAmount,
        payableAmount
      });

      // Create linked payment record
      const payment = await tx.payments.create({
        membershipId: createdMembership.id,
        memberId: dto.memberId,
        branchId: dto.branchId,
        instrumentId: dto.instrumentId,
        amount: payableAmount,
        refundAmount: 0,
        method: dto.paymentMode as any,
        status: 'COLLECTED',
        transactionRef: `${dto.paymentMode}-TXN-${Math.floor(100000 + Math.random() * 899999)}`
      });

      // Update Member enrolled status and instrument/branch if needed
      await tx.members.update(dto.memberId, {
        enrolledInstrumentId: dto.instrumentId,
        branchId: dto.branchId,
        status: 'ACTIVE'
      });

      // Log Audit entry
      await tx.audit.create({
        entityType: 'MEMBERSHIP',
        entityId: createdMembership.id,
        action: 'CREATE',
        performedByUserId: currentUser.id,
        changes: {
          planId: dto.planId,
          durationMonths: plan.durationMonths,
          startDate: toISODateOnly(startDate),
          expiryDate: toISODateOnly(expiryDate),
          amountPaid: payableAmount
        }
      });

      return {
        membership: createdMembership,
        payment,
        daysRemaining: calculateRemainingDays(createdMembership.expiryDate)
      };
    });
  }

  public async renewMembership(id: string, dto: RenewMembershipDto, currentUser: AuthenticatedUserPayload) {
    const existingMembership = await db.memberships.findUnique(id);
    if (!existingMembership) {
      throw new NotFoundError('Membership', id);
    }

    if (currentUser.role === 'CLIENT' && currentUser.memberId !== existingMembership.memberId) {
      throw new ForbiddenError('Cannot renew another member’s subscription');
    }

    const plan = await db.plans.findUnique(dto.planId);
    if (!plan) {
      throw new NotFoundError('MembershipPlan', dto.planId);
    }

    const instrument = await db.instruments.findUnique(existingMembership.instrumentId);
    const rawSubtotal = (instrument?.startingPricePerMonth || 3500) * plan.durationMonths;
    const discountAmount = Math.round(rawSubtotal * (plan.discountPercentage / 100));
    const payableAmount = rawSubtotal - discountAmount;

    // Define and document non-destructive renewal:
    // If active, extends from current expiry date. If expired, starts from today.
    const { newStartDate, newExpiryDate, daysAdded } = computeRenewalDates(
      existingMembership.expiryDate,
      plan.durationMonths
    );

    return await db.runInTransaction(async tx => {
      // Historical preservation: Mark previous as completed/renewed or create renewal record
      const renewedRecord = await tx.memberships.create({
        memberId: existingMembership.memberId,
        planId: dto.planId,
        instrumentId: existingMembership.instrumentId,
        branchId: existingMembership.branchId,
        startDate: toISODateOnly(newStartDate),
        expiryDate: toISODateOnly(newExpiryDate),
        status: 'ACTIVE',
        paymentStatus: 'COLLECTED',
        totalFee: rawSubtotal,
        discountAmount,
        payableAmount
      });

      // Record payment
      const payment = await tx.payments.create({
        membershipId: renewedRecord.id,
        memberId: existingMembership.memberId,
        branchId: existingMembership.branchId,
        instrumentId: existingMembership.instrumentId,
        amount: payableAmount,
        refundAmount: 0,
        method: dto.paymentMode as any,
        status: 'COLLECTED',
        transactionRef: `${dto.paymentMode}-RENEW-${Math.floor(100000 + Math.random() * 899999)}`
      });

      await tx.members.update(existingMembership.memberId, {
        status: 'ACTIVE'
      });

      return {
        message: `Membership successfully renewed. Extended by ${daysAdded} days without losing active time.`,
        renewedMembership: renewedRecord,
        payment
      };
    });
  }
}

export const membershipsService = new MembershipsService();
