import { db, TeacherRecord } from '../../database/repository';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { CreateTeacherDto, UpdateTeacherDto } from './teachers.schema';
import { INSTRUMENT_IDS, BRANCH_IDS } from '../../config/constants';

export class TeachersService {
  public async getTeachers(filter?: { branchId?: string; instrumentId?: string; isActive?: boolean }) {
    return await db.teachers.findMany(filter);
  }

  public async getTeacherById(id: string) {
    const teacher = await db.teachers.findUnique(id);
    if (!teacher) {
      throw new NotFoundError('Teacher', id);
    }
    const bookings = await db.bookings.findMany();
    const assignedClasses = bookings.filter(b => b.teacherId === id && b.status !== 'CANCELLED');

    return {
      ...teacher,
      activeAssignedClassesCount: assignedClasses.length,
      assignedClasses: assignedClasses.slice(0, 5)
    };
  }

  public async createTeacher(dto: CreateTeacherDto) {
    // Validate instruments against supported 7
    for (const inst of dto.instrumentsTaught) {
      if (!INSTRUMENT_IDS.includes(inst as any)) {
        throw new BadRequestError(`Unsupported instrument '${inst}'. Supported: ${INSTRUMENT_IDS.join(', ')}`);
      }
    }

    // Validate branches against supported 3
    for (const br of dto.assignedBranches) {
      if (!BRANCH_IDS.includes(br as any)) {
        throw new BadRequestError(`Unsupported branch '${br}'. Supported: ${BRANCH_IDS.join(', ')}`);
      }
    }

    const created = await db.teachers.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      instrumentsTaught: dto.instrumentsTaught,
      assignedBranches: dto.assignedBranches,
      availability: dto.availability || 'Full Time',
      employmentStatus: dto.employmentStatus || 'Active',
      joiningDate: dto.joiningDate || new Date().toISOString().split('T')[0],
      bio: dto.bio || '',
      rating: 5.0,
      isActive: true
    });

    return created;
  }

  public async updateTeacher(id: string, dto: UpdateTeacherDto) {
    const teacher = await db.teachers.findUnique(id);
    if (!teacher) {
      throw new NotFoundError('Teacher', id);
    }

    if (dto.instrumentsTaught) {
      for (const inst of dto.instrumentsTaught) {
        if (!INSTRUMENT_IDS.includes(inst as any)) {
          throw new BadRequestError(`Unsupported instrument '${inst}'. Supported: ${INSTRUMENT_IDS.join(', ')}`);
        }
      }
    }

    if (dto.assignedBranches) {
      for (const br of dto.assignedBranches) {
        if (!BRANCH_IDS.includes(br as any)) {
          throw new BadRequestError(`Unsupported branch '${br}'. Supported: ${BRANCH_IDS.join(', ')}`);
        }
      }
    }

    const updated = await db.teachers.update(id, dto);
    return updated;
  }

  public async deactivateTeacher(id: string) {
    const teacher = await db.teachers.findUnique(id);
    if (!teacher) {
      throw new NotFoundError('Teacher', id);
    }

    // Soft delete to protect historical class bookings
    const deactivated = await db.teachers.softDelete(id);
    return {
      message: `Teacher ${deactivated.fullName} successfully deactivated (soft-deleted). Historical class logs preserved.`,
      teacher: deactivated
    };
  }
}

export const teachersService = new TeachersService();
