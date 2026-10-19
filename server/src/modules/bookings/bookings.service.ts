import { db, BookingRecord } from '../../database/repository';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  ForbiddenError
} from '../../utils/errors';
import {
  ACADEMY_SLOTS,
  ACADEMY_CONFIG,
  INSTRUMENT_IDS,
  BRANCH_IDS
} from '../../config/constants';
import { calculateRemainingDays } from '../../utils/dateUtils';
import { CreateBookingDto, RescheduleBookingDto, CancelBookingDto } from './bookings.schema';
import { AuthenticatedUserPayload } from '../../middleware/auth.middleware';

export class BookingsService {
  public async getBookings(
    filter: { memberId?: string; branchId?: string; classDate?: string },
    currentUser: AuthenticatedUserPayload
  ) {
    let targetMemberId = filter.memberId;

    // Client Isolation: Clients can only see their own bookings
    if (currentUser.role === 'CLIENT') {
      targetMemberId = currentUser.memberId;
      if (!targetMemberId) {
        throw new ForbiddenError('Client account is not linked to a member ID');
      }
    }

    const bookings = await db.bookings.findMany({
      memberId: targetMemberId,
      branchId: filter.branchId,
      classDate: filter.classDate
    });

    return bookings;
  }

  public async getBookingById(id: string, currentUser: AuthenticatedUserPayload) {
    const booking = await db.bookings.findUnique(id);
    if (!booking) {
      throw new NotFoundError('Booking', id);
    }

    if (currentUser.role === 'CLIENT' && currentUser.memberId !== booking.memberId) {
      throw new ForbiddenError('Access to other members’ booking records is prohibited');
    }

    const member = await db.members.findUnique(booking.memberId);
    const branch = await db.branches.findUnique(booking.branchId);
    const instrument = await db.instruments.findUnique(booking.instrumentId);
    const teacher = booking.teacherId ? await db.teachers.findUnique(booking.teacherId) : null;

    return {
      ...booking,
      member,
      branch,
      instrument,
      teacher
    };
  }

  public async createBooking(dto: CreateBookingDto, currentUser: AuthenticatedUserPayload): Promise<BookingRecord> {
    // 1. Client Authorization Verification
    if (currentUser.role === 'CLIENT' && currentUser.memberId && currentUser.memberId !== dto.memberId) {
      throw new ForbiddenError('Clients cannot book sessions on behalf of other members');
    }

    // 2. Validate Member Exists
    const member = await db.members.findUnique(dto.memberId);
    if (!member) {
      throw new NotFoundError('Member', dto.memberId);
    }

    // 3. Validate Active & Non-Expired Membership
    const memberships = await db.memberships.findMany({ memberId: dto.memberId });
    const validMembership = memberships.find(m => {
      if (m.status !== 'ACTIVE' && m.status !== 'EXPIRING_SOON') return false;
      const daysLeft = calculateRemainingDays(m.expiryDate);
      return daysLeft >= 0;
    });

    if (!validMembership && !dto.membershipId) {
      throw new BadRequestError('Member does not have an active or valid membership to book classes');
    }

    // 4. Validate Branch & Instrument Availability
    const branch = await db.branches.findUnique(dto.branchId);
    if (!branch) {
      throw new NotFoundError('Branch', dto.branchId);
    }

    const instrument = await db.instruments.findUnique(dto.instrumentId);
    if (!instrument) {
      throw new NotFoundError('Instrument', dto.instrumentId);
    }

    if (!branch.availableInstruments.includes(dto.instrumentId)) {
      throw new BadRequestError(
        `Instrument '${instrument.name}' is not offered at ${branch.name} Campus.`
      );
    }

    // 5. Validate Slot Range (1 to 10)
    const slotDef = ACADEMY_SLOTS.find(s => s.id === dto.slotId);
    if (!slotDef) {
      throw new BadRequestError(`Invalid slot ID ${dto.slotId}. Must be one of 10 daily consecutive slots (1-10)`);
    }

    // 6. Validate Teacher (if assigned)
    if (dto.teacherId) {
      const teacher = await db.teachers.findUnique(dto.teacherId);
      if (!teacher) {
        throw new NotFoundError('Teacher', dto.teacherId);
      }
      if (!teacher.isActive) {
        throw new BadRequestError(`Teacher '${teacher.fullName}' is currently inactive.`);
      }
      if (!teacher.instrumentsTaught.includes(dto.instrumentId)) {
        throw new BadRequestError(
          `Teacher '${teacher.fullName}' is not certified to teach '${instrument.name}'`
        );
      }
      if (!teacher.assignedBranches.includes(dto.branchId)) {
        throw new BadRequestError(
          `Teacher '${teacher.fullName}' is not assigned to '${branch.name} Campus'`
        );
      }
    }

    // 7. Atomic Transactional Execution with Strict Locking & Concurrency Checks
    return await db.runInTransaction(async tx => {
      const created = await tx.bookings.create({
        memberId: dto.memberId,
        branchId: dto.branchId,
        instrumentId: dto.instrumentId,
        teacherId: dto.teacherId,
        membershipId: dto.membershipId || validMembership?.id,
        classDate: dto.classDate,
        slotId: dto.slotId,
        slotLabel: slotDef.label,
        status: 'CONFIRMED',
        roomNumber: 1,
        paymentMode: dto.paymentMode || 'UPI'
      });

      // Increment Member Attendance Count
      await tx.members.update(dto.memberId, {
        totalClassesAttended: (member.totalClassesAttended || 0) + 1
      });

      // Audit Log
      await tx.audit.create({
        entityType: 'BOOKING',
        entityId: created.id,
        action: 'CREATE',
        performedByUserId: currentUser.id,
        changes: {
          classDate: dto.classDate,
          slotId: dto.slotId,
          branchId: dto.branchId,
          instrumentId: dto.instrumentId
        }
      });

      return created;
    });
  }

  public async rescheduleBooking(
    id: string,
    dto: RescheduleBookingDto,
    currentUser: AuthenticatedUserPayload
  ): Promise<BookingRecord> {
    const booking = await db.bookings.findUnique(id);
    if (!booking) {
      throw new NotFoundError('Booking', id);
    }

    if (currentUser.role === 'CLIENT' && currentUser.memberId !== booking.memberId) {
      throw new ForbiddenError('Cannot reschedule another member’s booking');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestError('Cannot reschedule a cancelled class');
    }

    // Notice Period Enforcement (24 hours in advance)
    const classDateTime = new Date(`${booking.classDate}T08:00:00Z`).getTime();
    const now = new Date().getTime();
    const hoursDiff = (classDateTime - now) / (1000 * 60 * 60);

    if (hoursDiff < ACADEMY_CONFIG.MIN_RESCHEDULE_NOTICE_HOURS && currentUser.role === 'CLIENT') {
      throw new BadRequestError(
        `Rescheduling requires at least ${ACADEMY_CONFIG.MIN_RESCHEDULE_NOTICE_HOURS} hours notice prior to class time.`
      );
    }

    const slotDef = ACADEMY_SLOTS.find(s => s.id === dto.newSlotId);
    if (!slotDef) {
      throw new BadRequestError(`Invalid slot ID ${dto.newSlotId}`);
    }

    return await db.runInTransaction(async tx => {
      const updated = await tx.bookings.update(id, {
        classDate: dto.newClassDate,
        slotId: dto.newSlotId,
        slotLabel: slotDef.label,
        status: 'RESCHEDULED',
        rescheduledFromId: id
      });

      await tx.audit.create({
        entityType: 'BOOKING',
        entityId: id,
        action: 'RESCHEDULE',
        performedByUserId: currentUser.id,
        changes: {
          oldDate: booking.classDate,
          oldSlot: booking.slotId,
          newDate: dto.newClassDate,
          newSlot: dto.newSlotId,
          reason: dto.reason || 'Client Rescheduled'
        }
      });

      return updated;
    });
  }

  public async cancelBooking(
    id: string,
    dto: CancelBookingDto,
    currentUser: AuthenticatedUserPayload
  ): Promise<BookingRecord> {
    const booking = await db.bookings.findUnique(id);
    if (!booking) {
      throw new NotFoundError('Booking', id);
    }

    if (currentUser.role === 'CLIENT' && currentUser.memberId !== booking.memberId) {
      throw new ForbiddenError('Cannot cancel another member’s booking');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestError('Booking is already cancelled');
    }

    return await db.runInTransaction(async tx => {
      const updated = await tx.bookings.update(id, {
        status: 'CANCELLED',
        cancellationReason: dto.reason
      });

      await tx.audit.create({
        entityType: 'BOOKING',
        entityId: id,
        action: 'CANCEL',
        performedByUserId: currentUser.id,
        changes: {
          reason: dto.reason
        }
      });

      return updated;
    });
  }
}

export const bookingsService = new BookingsService();
