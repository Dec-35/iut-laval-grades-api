import { Request, Response } from 'express';
import { pool } from '../config/database';
import { AppError } from '../types/error';

export const statsController = {
  async getCourseStats(req: Request, res: Response): Promise<void> {
    const { courseId } = req.params;
    const { academicYear } = req.query as { academicYear: string };

    try {
      const result = await pool.query(
        `
        SELECT 
          c.code as "courseCode",
          c.name as "courseName",
          COALESCE(AVG(g.grade), 0) as "averageGrade",
          COALESCE(MIN(g.grade), 0) as "minGrade",
          COALESCE(MAX(g.grade), 0) as "maxGrade",
          COUNT(g.id) as "totalStudents",
          COALESCE(COUNT(CASE WHEN g.grade >= 10 THEN 1 END)::float / NULLIF(COUNT(*), 0)::float * 100, 0) as "successRate"
        FROM courses c
        LEFT JOIN grades g ON g.course_id = c.id AND g.academic_year = $2
        WHERE c.id = $1
        GROUP BY c.id, c.code, c.name
      `,
        [courseId, academicYear]
      );

      res.status(200).json(result.rows[0]);
    } catch (error) {
      throw new AppError(
        500,
        'Erreur lors de la récupération des statistiques du cours',
        'STATS_ERROR'
      );
    }
  },

  async getStudentSemesterStats(req: Request, res: Response): Promise<void> {
    const { studentId } = req.params;
    const { academicYear } = req.query as { academicYear: string };

    try {
      const result = await pool.query(
        `
        SELECT 
          g.semester,
          SUM(g.grade * c.credits) / SUM(c.credits) as "averageGrade",
          SUM(c.credits) as "totalCredits",
          SUM(CASE WHEN g.grade >= 10 THEN c.credits ELSE 0 END) as "validatedCredits",
          COUNT(DISTINCT c.id) as "coursesCount"
        FROM grades g
        JOIN courses c ON c.id = g.course_id
        WHERE g.student_id = $1 AND g.academic_year = $2
        GROUP BY g.semester
        ORDER BY g.semester
      `,
        [studentId, academicYear]
      );

      res.status(200).json(result.rows);
    } catch (error) {
      throw new AppError(
        500,
        "Erreur lors de la récupération des statistiques de l'étudiant",
        'STATS_ERROR'
      );
    }
  },

  async getGlobalStats(req: Request, res: Response): Promise<void> {
    const { academicYear } = req.query as { academicYear: string };

    try {
      const result = await pool.query(
        `
        WITH course_stats AS (
          SELECT 
            g.grade,
            c.credits,
            g.student_id,
            COUNT(CASE WHEN g.grade >= 10 THEN 1 END)::float / COUNT(*)::float * 100 as success_rate
          FROM courses c
          JOIN grades g ON g.course_id = c.id
          WHERE g.academic_year = $1
          GROUP BY g.grade, c.credits, g.student_id
        )
        SELECT 
          SUM(grade * credits) / SUM(credits) as "globalAverage",
          COUNT(DISTINCT student_id) as "totalStudents",
          COUNT(DISTINCT student_id) as "totalCourses",
          AVG(success_rate) as "averageSuccessRate"
        FROM course_stats
      `,
        [academicYear]
      );

      res.status(200).json(result.rows[0]);
    } catch (error) {
      throw new AppError(
        500,
        'Erreur lors de la récupération des statistiques globales',
        'STATS_ERROR'
      );
    }
  },
};
