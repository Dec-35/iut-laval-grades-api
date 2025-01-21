import { Request, Response } from 'express';
import { pool } from '../config/database';
import { CreateStudentInput } from '../schemas/student.schema';

export const studentController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT id, first_name as "firstName", last_name as "lastName", email, date_of_birth as "dateOfBirth", student_id as "studentId" FROM students'
      );
      res.status(200).json(result.rows);
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Erreur lors de la récupération des étudiants' });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'SELECT id, first_name as "firstName", last_name as "lastName", email, date_of_birth as "dateOfBirth", student_id as "studentId" FROM students WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Étudiant non trouvé' });
        return;
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération de l'étudiant" });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      studentId,
    }: CreateStudentInput = req.body;
    try {
      const result = await pool.query(
        `
        INSERT INTO students (first_name, last_name, email, date_of_birth, student_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING 
          id,
          first_name as "firstName",
          last_name as "lastName",
          email,
          date_of_birth as "dateOfBirth",
          student_id as "studentId"
      `,
        [firstName, lastName, email, dateOfBirth, studentId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la création de l'étudiant" });
    }
  },
};
