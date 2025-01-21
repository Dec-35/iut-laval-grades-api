import { Request, Response } from 'express';
import { authController } from '../../controllers/authController';
import { pool } from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../types/error';

jest.mock('../../config/database');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('authController.login', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
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

  it('should return 401 if email is incorrect', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

    await authController.login(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'Email ou mot de passe incorrect' });
  });

  it('should return 401 if password is incorrect', async () => {
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [{ passwordHash: 'hashedPassword' }],
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await authController.login(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'Email ou mot de passe incorrect' });
  });

  it('should return 200 and a token if login is successful', async () => {
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [{ id: 1, passwordHash: 'hashedPassword' }],
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('token');

    await authController.login(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ professor: {
      id: 1,
      firstName: undefined,
      department: undefined,
      email: undefined,
    },token: 'token' });
  });

  it('should return 500 if there is a database error', async () => {
    (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

    try {
      await authController.login(req as Request, res as Response);
    } catch (error) {
      if (error instanceof AppError) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Erreur lors de la connexion');
      }
    }
  });
});