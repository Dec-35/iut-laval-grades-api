import { Request, Response } from 'express';
import { studentController } from '../../controllers/studentController';
import { pool } from '../../config/database';
import { AppError } from '../../types/error';

jest.mock('../../config/database');

describe('studentController.create', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    req = {
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dateOfBirth: '2000-01-01',
        studentId: '12345',
      },
    };
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

  it('should return 201 and the created student if creation is successful', async () => {
    const createdStudent = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      dateOfBirth: '2000-01-01',
      studentId: '12345',
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [createdStudent] });

    await studentController.create(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(createdStudent);
  });

  it('should return 500 if there is a database error', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await studentController.create(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Internal server error');
      }
    }
  });
  describe('getAll', () => {
    it('should return all students', async () => {
      const students = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          dateOfBirth: '2000-01-01',
          studentId: '12345',
        },
      ];
      (pool.query as jest.Mock).mockResolvedValue({ rows: students });

      await studentController.getAll(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(students);
    });

    it('should return 500 if there is a database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await studentController.getAll(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération des étudiants',
      });
    });
  });

  describe('getById', () => {
    it('should return the student if found', async () => {
      const student = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dateOfBirth: '2000-01-01',
        studentId: '12345',
      };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [student] });

      req = { params: { id: '1' } };

      await studentController.getById(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(student);
    });

    it('should return 404 if student is not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      req = { params: { id: '1' } };

      await studentController.getById(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ error: 'Étudiant non trouvé' });
    });

    it('should return 500 if there is a database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      req = { params: { id: '1' } };

      await studentController.getById(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        error: 'Erreur lors de la récupération de l\'étudiant',
      });
    });
  });
});