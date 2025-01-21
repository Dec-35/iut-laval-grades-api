import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { LoginInput } from '../schemas/auth.schema';
import { AppError } from '../types/error';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password }: LoginInput = req.body;

    try {
      const result = await pool.query(
        'SELECT id, email, password_hash as "passwordHash", first_name as "firstName", department FROM professors WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        return;
      }

      const professor = result.rows[0];
      const validPassword = await bcrypt.compare(
        password,
        professor.passwordHash
      );

      if (!validPassword) {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        return;
      }

      const token = jwt.sign(
        {
          id: professor.id,
          email: professor.email,
          role: 'professor',
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      res.status(200).json({
        token,
        professor: {
          id: professor.id,
          email: professor.email,
          firstName: professor.firstName,
          department: professor.department,
        },
      });
    } catch (error) {
      throw new AppError(500, 'Erreur lors de la connexion', 'AUTH_ERROR');
    }
  },
};
