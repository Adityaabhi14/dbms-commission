import { db } from '../../database/repository';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { calculateRemainingDays, determineMembershipStatus } from '../../utils/dateUtils';
import { MemberFilterQuery, UpdateMemberDto } from './members.schema';
import { AuthenticatedUserPayload } from '../../middleware/auth.middleware';

export class MembersService {
  public async getMembers(query: MemberFilterQuery) {
    let members = await db.members.findMany();

    // Attach dynamic active membership expiry and days remaining
    const allMemberships = await db.memberships.findMany();

    let enriched = members.map(m => {
      const activeMembership = allMemberships.find(
        mem => mem.memberId === m.id && mem.status !== 'CANCELLED'
      );
      const daysRemaining = activeMembership
        ? calculateRemainingDays(activeMembership.expiryDate)
        : 0;

      return {
        ...m,
        membership: activeMembership || null,
        daysRemaining,
        expiryDate: activeMembership ? activeMembership.expiryDate : null
      };
    });

    // Filtering
    if (query.search) {
      const s = query.search.toLowerCase();
      enriched = enriched.filter(
        m => m.fullName.toLowerCase().includes(s) ||
             m.email.toLowerCase().includes(s) ||
             m.id.toLowerCase().includes(s) ||
             m.phone.includes(s)
      );
    }

    if (query.branchId && query.branchId !== 'all') {
      enriched = enriched.filter(m => m.branchId === query.branchId);
    }

    if (query.instrumentId && query.instrumentId !== 'all') {
      enriched = enriched.filter(m => m.enrolledInstrumentId === query.instrumentId);
    }

    if (query.status && query.status !== 'all') {
      enriched = enriched.filter(m => m.status === query.status);
    }

    // Sorting
    enriched.sort((a, b) => {
      let cmp = 0;
      if (query.sortBy === 'name') {
        cmp = a.fullName.localeCompare(b.fullName);
      } else if (query.sortBy === 'daysRemaining') {
        cmp = a.daysRemaining - b.daysRemaining;
      } else if (query.sortBy === 'status') {
        cmp = a.status.localeCompare(b.status);
      } else {
        cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return query.sortOrder === 'asc' ? cmp : -cmp;
    });

    // Pagination
    const total = enriched.length;
    const page = query.page;
    const limit = query.limit;
    const totalPages = Math.ceil(total / limit);
    const paginated = enriched.slice((page - 1) * limit, page * limit);

    return {
      members: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  public async getMemberById(id: string, currentUser: AuthenticatedUserPayload) {
    // Client Isolation: Clients can only access their own profile
    if (currentUser.role === 'CLIENT' && currentUser.memberId !== id) {
      throw new ForbiddenError('Clients are not authorized to view other members’ records');
    }

    const member = await db.members.findUnique(id);
    if (!member) {
      throw new NotFoundError('Member', id);
    }

    const memberships = await db.memberships.findMany({ memberId: id });
    const bookings = await db.bookings.findMany({ memberId: id });
    const payments = await db.payments.findMany({ memberId: id });

    const activeMembership = memberships.find(m => m.status === 'ACTIVE' || m.status === 'EXPIRING_SOON');
    const daysRemaining = activeMembership ? calculateRemainingDays(activeMembership.expiryDate) : 0;

    return {
      ...member,
      daysRemaining,
      activeMembership: activeMembership || null,
      memberships,
      recentBookings: bookings.slice(0, 5),
      payments
    };
  }

  public async updateMember(id: string, dto: UpdateMemberDto) {
    const member = await db.members.findUnique(id);
    if (!member) {
      throw new NotFoundError('Member', id);
    }

    const updated = await db.members.update(id, dto);
    return updated;
  }

  public async getExpiringMembers(withinDays = 15) {
    const allMemberships = await db.memberships.findMany();
    const members = await db.members.findMany();

    const expiring = [];

    for (const member of members) {
      const activeMembership = allMemberships.find(
        m => m.memberId === member.id && (m.status === 'ACTIVE' || m.status === 'EXPIRING_SOON')
      );
      if (activeMembership) {
        const days = calculateRemainingDays(activeMembership.expiryDate);
        if (days >= 0 && days <= withinDays) {
          expiring.push({
            ...member,
            membershipId: activeMembership.id,
            planId: activeMembership.planId,
            expiryDate: activeMembership.expiryDate,
            daysRemaining: days
          });
        }
      }
    }

    expiring.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return {
      thresholdDays: withinDays,
      totalCount: expiring.length,
      expiringMembers: expiring
    };
  }
}

export const membersService = new MembersService();
