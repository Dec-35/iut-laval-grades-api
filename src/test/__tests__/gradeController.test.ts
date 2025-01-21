import { Request, Response } from 'express';
import { gradeController } from '../../controllers/gradeController';
import { pool } from '../../config/database';
import { AppError } from '../../types/error';

jest.mock('../../config/database');
jest.mock('../../services/pdfService');

describe('gradeController.create', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    req = {
      body: {
        studentId: 1,
        courseId: 1,
        grade: 90,
        semester: 'Fall',
        academicYear: '2021-2022',
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

  it('should return 404 if student does not exist', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    try {
      await gradeController.create(req as Request, res as Response);
    } catch (error) {
      if(error instanceof AppError) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Étudiant non trouvé');
      }
    }
  });

  it('should return 404 if course does not exist', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    try {
      await gradeController.create(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Cours non trouvé');
      }
    }
  });

  it('should return 201 and the created grade if creation is successful', async () => {
    const createdGrade = {
      id: 1,
      studentId: 1,
      courseId: 1,
      grade: 90,
      semester: 'Fall',
      academicYear: '2021-2022',
    };
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: 1 }] });
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [createdGrade] });

    await gradeController.create(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(createdGrade);
  });

  it('should return 500 if there is a database error', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await gradeController.create(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Erreur lors de la création de la note');
      }
    }
  });
  
});
describe('gradeController.getAll', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    req = {};
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

  it('should return all grades', async () => {
    const mockGrades = [{ id: 1, grade: 'A' }];
    (pool.query as jest.Mock).mockResolvedValue({ rows: mockGrades });

    await gradeController.getAll(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockGrades);
  });

  it('should handle database errors', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await gradeController.getAll(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Erreur lors de la récupération des notes');
      }
    }
  });
});

describe('gradeController.getByStudent', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    req = {
      params: { studentId: '1' },
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

  it('should return grades for a specific student', async () => {
    const mockGrades = [{ id: 1, grade: 'A' }];
    (pool.query as jest.Mock).mockResolvedValue({ rows: mockGrades });

    await gradeController.getByStudent(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockGrades);
  });

  it('should handle database errors', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await gradeController.getByStudent(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe("Erreur lors de la récupération des notes de l'étudiant");
      }
    }
  });
});

describe('gradeController.update', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    req = {
      params: { id: '1' },
      body: { grade: 'B' },
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

  it('should update a grade successfully', async () => {
    const updatedGrade = { id: 1, grade: 'B', semester: 'Fall', academicYear: '2021-2022' };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [updatedGrade] });

    await gradeController.update(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(updatedGrade);
  });

  it('should return 404 if grade not found', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

    try {
      await gradeController.update(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Note non trouvée');
      }
    }
  });

  it('should handle database errors', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await gradeController.update(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Erreur lors de la mise à jour de la note');
      }
    }
  });
});

describe('gradeController.delete', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    req = {
      params: { id: '1' },
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

  it('should delete a grade successfully', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ id: '1' }] });

    await gradeController.delete(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(204);
  });

  it('should return 404 if grade not found', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

    try {
      await gradeController.delete(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Note non trouvée');
      }
    }
  });

  it('should handle database errors', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await gradeController.delete(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Erreur lors de la suppression de la note');
      }
    }
  });
});

describe('gradeController.generateTranscript', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;
  let setHeader: jest.Mock;
  let write: jest.Mock;
  let end: jest.Mock;

  beforeEach(() => {
    req = {
      params: { studentId: '1' },
      query: { academicYear: '2021-2022' },
    };
    status = jest.fn().mockReturnThis();
    json = jest.fn();
    setHeader = jest.fn();
    write = jest.fn();
    end = jest.fn();
    res = {
      status,
      json,
      setHeader,
      write,
      end,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if student not found', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    try {
      await gradeController.generateTranscript(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Étudiant non trouvé');
      }
    }
  });

  it('should return 404 if no grades found for the student', async () => {
    const mockStudent = { firstName: 'John', lastName: 'Doe', studentId: '1' };
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockStudent] });
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    try {
      await gradeController.generateTranscript(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Aucune note trouvée pour cet étudiant');
      }
    }
  });

  it('should handle database errors', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await gradeController.generateTranscript(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Erreur lors de la génération du relevé');
      }
    }
  });
});