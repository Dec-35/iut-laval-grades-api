import { Request, Response } from 'express';
import { pool } from '../config/database';
import { CreateCourseInput } from '../schemas/course.schema';
import { AppError } from '../types/error';

export const courseController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(`
        SELECT 
          id,
          code,
          name,
          credits,
          description
        FROM courses
      `);
      res.status(200).json(result.rows);
    } catch (error) {
      throw new AppError(
        500,
        'Erreur lors de la récupération des cours',
        'COURSES_FETCH_ERROR'
      );
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `
        SELECT 
          id,
          code,
          name,
          credits,
          description
        FROM courses 
        WHERE id = $1
      `,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'Cours non trouvé', 'COURSE_NOT_FOUND');
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        500,
        'Erreur lors de la récupération du cours',
        'COURSE_FETCH_ERROR'
      );
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    const { code, name, credits, description }: CreateCourseInput = req.body;
    try {
      const result = await pool.query(
        `
        INSERT INTO courses (code, name, credits, description)
        VALUES ($1, $2, $3, $4)
        RETURNING 
          id,
          code,
          name,
          credits,
          description
      `,
        [code, name, credits, description]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        throw new AppError(
          409,
          'Un cours avec ce code existe déjà',
          'COURSE_ALREADY_EXISTS'
        );
      }
      throw new AppError(
        500,
        'Erreur lors de la création du cours',
        'COURSE_CREATE_ERROR'
      );
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { code, name, credits, description }: CreateCourseInput = req.body;
    try {
      const result = await pool.query(
        `
        UPDATE courses 
        SET code = $1, name = $2, credits = $3, description = $4
        WHERE id = $5
        RETURNING 
          id,
          code,
          name,
          credits,
          description
      `,
        [code, name, credits, description, id]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'Cours non trouvé', 'COURSE_NOT_FOUND');
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        500,
        'Erreur lors de la mise à jour du cours',
        'COURSE_UPDATE_ERROR'
      );
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM courses WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'Cours non trouvé', 'COURSE_NOT_FOUND');
      }

      res.status(204).json();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        500,
        'Erreur lors de la suppression du cours',
        'COURSE_DELETE_ERROR'
      );
    }
  },
};
