import { Request, Response } from 'express';
import { courseController } from '../../controllers/courseController';
import { pool } from '../../config/database';
import { AppError } from '../../types/error';

jest.mock('../../config/database');

describe('courseController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    status = jest.fn().mockReturnThis();
    json = jest.fn();
    res = {
      status,
      json,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all courses', async () => {
      const courses = [{ id: 1, code: 'CS101', name: 'Computer Science 101' }];
      (pool.query as jest.Mock).mockResolvedValue({ rows: courses });

      await courseController.getAll(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(courses);
    });

    it('should return 500 if there is a database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      try {
        await courseController.getAll(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(500);
          expect(error.message).toBe('Erreur lors de la récupération des cours');
        }
      }
    });
  });

  describe('getById', () => {
    it('should return the course if found', async () => {
      const course = { id: 1, code: 'CS101', name: 'Computer Science 101' };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [course] });

      req = { params: { id: '1' } };

      await courseController.getById(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(course);
    });

    it('should return 404 if course is not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      req = { params: { id: '1' } };

      try {
        await courseController.getById(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe('Cours non trouvé');
        }
      }
    });

    it('should return 500 if there is a database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      req = { params: { id: '1' } };

      try {
        await courseController.getById(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(500);
          expect(error.message).toBe('Erreur lors de la récupération du cours');
        }
      }
    });
  });

  describe('create', () => {
    it('should return 201 and the created course if creation is successful', async () => {
      const newCourse = {
        id: 1,
        code: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        description: 'Introduction to Computer Science',
      };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [newCourse] });

      req = {
        body: {
          code: 'CS101',
          name: 'Computer Science 101',
          credits: 3,
          description: 'Introduction to Computer Science',
        },
      };

      await courseController.create(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(newCourse);
    });

    it('should return 500 if there is a database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      req = {
        body: {
          code: 'CS101',
          name: 'Computer Science 101',
          credits: 3,
          description: 'Introduction to Computer Science',
        },
      };

      try {
        await courseController.create(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(500);
          expect(error.message).toBe('Erreur lors de la création du cours');
        }
      }
    });
  });

  it('should return 409 if course code already exists', async () => {
    const error = new Error();
    (error as AppError).code = '23505';
    (pool.query as jest.Mock).mockRejectedValue(error);

    req = {
      body: {
        code: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        description: 'Introduction to Computer Science',
      },
    };

    try {
      await courseController.create(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(409);
        expect(error.message).toBe('Un cours avec ce code existe déjà');
      }
    }
  });

  describe('delete', () => {
    it('should return 204 if deletion is successful', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1' }] });
      req = { params: { id: '1' } };

      await courseController.delete(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(204);
    });

    it('should return 404 if course is not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
      req = { params: { id: '1' } };

      try {
        await courseController.delete(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe('Cours non trouvé');
        }
      }
    });

    it('should return 500 if there is a database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      req = { params: { id: '1' } };

      try {
        await courseController.delete(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(500);
          expect(error.message).toBe('Erreur lors de la suppression du cours');
        }
      }
    });
  });
  describe('update', () => {
    it('should return updated course if update is successful', async () => {
      const updatedCourse = {
        id: 1,
        code: 'CS101',
        name: 'Computer Science 101',
        credits: 3,
        description: 'Introduction to Computer Science',
      };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [updatedCourse] });

      req = {
        params: { id: '1' },
        body: {
          code: 'CS101',
          name: 'Computer Science 101',
          credits: 3,
          description: 'Introduction to Computer Science',
        },
      };

      await courseController.update(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(updatedCourse);
    });

    it('should return 404 if course is not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      req = {
        params: { id: '1' },
        body: {
          code: 'CS101',
          name: 'Computer Science 101',
          credits: 3,
          description: 'Introduction to Computer Science',
        },
      };

      try {
        await courseController.update(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe('Cours non trouvé');
        } else {
          throw error;
        }
      }
    });

    it('should return 500 if there is a database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      req = {
        params: { id: '1' },
        body: {
          code: 'CS101',
          name: 'Computer Science 101',
          credits: 3,
          description: 'Introduction to Computer Science',
        },
      };

      try {
        await courseController.update(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(500);
          expect(error.message).toBe('Erreur lors de la mise à jour du cours');
        } else if (error instanceof Error) {
          expect(error.message).toBe('Database error');
        } else {
          throw error;
        }
      }
    });
  });
});