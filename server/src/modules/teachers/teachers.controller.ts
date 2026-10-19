import { Router, Request, Response, NextFunction } from 'express';
import { teachersService } from './teachers.service';
import { createTeacherSchema, updateTeacherSchema } from './teachers.schema';
import { validateBody } from '../../middleware/validate.middleware';
import { authenticate, requireOwner } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/teachers
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branchId = req.query.branchId as string | undefined;
      const instrumentId = req.query.instrumentId as string | undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : true;

      const teachers = await teachersService.getTeachers({ branchId, instrumentId, isActive });
      return res.json({
        success: true,
        data: teachers
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/teachers (Owner only)
router.post(
  '/',
  authenticate,
  requireOwner,
  validateBody(createTeacherSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacher = await teachersService.createTeacher(req.body);
      return res.status(201).json({
        success: true,
        data: teacher,
        message: 'Faculty mentor successfully registered'
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/teachers/:id
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacher = await teachersService.getTeacherById(req.params.id);
      return res.json({
        success: true,
        data: teacher
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/teachers/:id (Owner only)
router.patch(
  '/:id',
  authenticate,
  requireOwner,
  validateBody(updateTeacherSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teacher = await teachersService.updateTeacher(req.params.id, req.body);
      return res.json({
        success: true,
        data: teacher,
        message: 'Teacher details updated successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/teachers/:id (Owner only - soft delete)
router.delete(
  '/:id',
  authenticate,
  requireOwner,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await teachersService.deactivateTeacher(req.params.id);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

export const teachersRouter = router;
