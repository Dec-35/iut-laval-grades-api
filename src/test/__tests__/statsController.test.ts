import { Request, Response } from 'express';
import { statsController } from '../../controllers/statsController';
import { pool } from '../../config/database';
import { AppError } from '../../types/error';

jest.mock('../../config/database');

describe('statsController.getCourseStats', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    req = {
      params: { courseId: '1' },
      query: { academicYear: '2021-2022' },
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

  it('should return course stats if query is successful', async () => {
    const courseStats = {
      courseCode: 'CS101',
      courseName: 'Computer Science 101',
      averageGrade: 85,
      minGrade: 70,
      maxGrade: 95,
      totalStudents: 30,
      successRate: 90,
    };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [courseStats] });

    await statsController.getCourseStats(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(courseStats);
  });

  it('should return 404 if course is not found', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

    try {
      await statsController.getCourseStats(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Course not found');
      }
    }
  });

  it('should return 500 if there is a database error', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await statsController.getCourseStats(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Erreur lors de la récupération des statistiques du cours');
      }
    }
  });
  describe('statsController.getGlobalStats', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let status: jest.Mock;
    let json: jest.Mock;
  
    beforeEach(() => {
      req = {
        query: { academicYear: '2021-2022' },
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
  
    it('should return global stats if query is successful', async () => {
      const globalStats = {
        globalAverage: 85,
        totalStudents: 100,
        totalCourses: 10,
        averageSuccessRate: 90,
      };
      (pool.query as jest.Mock).mockResolvedValue({ rows: [globalStats] });
  
      await statsController.getGlobalStats(req as Request, res as Response);
  
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(globalStats);
    });
  
    it('should return 404 if no global stats are found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
  
      try {
        await statsController.getGlobalStats(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe('Global stats not found');
        }
      }
    });
  
    it('should return 500 if there is a database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));
  
      try {
        await statsController.getGlobalStats(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(500);
          expect(error.message).toBe('Erreur lors de la récupération des statistiques globales');
        }
      }
    });
  });
  
  describe('statsController.getStudentSemesterStats', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let status: jest.Mock;
    let json: jest.Mock;
  
    beforeEach(() => {
      req = {
        params: { studentId: '1' },
        query: { academicYear: '2021-2022' },
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
  
    it('should return student semester stats if query is successful', async () => {
      const studentSemesterStats = [
        {
          semester: 'Fall',
          averageGrade: 85,
          totalCredits: 30,
          validatedCredits: 25,
          coursesCount: 5,
        },
      ];
      (pool.query as jest.Mock).mockResolvedValue({ rows: studentSemesterStats });
  
      await statsController.getStudentSemesterStats(req as Request, res as Response);
  
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(studentSemesterStats);
    });
  
    it('should return 404 if no student semester stats are found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
  
      try {
        await statsController.getStudentSemesterStats(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toBe('Student semester stats not found');
        }
      }
    });
  
    it('should return 500 if there is a database error', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));
  
      try {
        await statsController.getStudentSemesterStats(req as Request, res as Response);
      } catch (error) {
        if (error instanceof AppError) {
          expect(error.statusCode).toBe(500);
          expect(error.message).toBe("Erreur lors de la récupération des statistiques de l'étudiant");
        }
      }
    });
  });
});