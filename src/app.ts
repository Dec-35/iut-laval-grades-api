import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { httpLogger } from './middleware/httpLogger';
import { swaggerSpec } from './config/swagger';
import { studentRoutes } from './routes/students';
import { courseRoutes } from './routes/courses';
import { gradeRoutes } from './routes/grades';
import { authRoutes } from './routes/auth';
import { statsRoutes } from './routes/stats';
import { setupUnhandledErrors } from './middleware/unhandledErrors';

// Configuration des gestionnaires d'erreurs globaux
setupUnhandledErrors();

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST'],
    credentials: true,
  };
app.use(cors(corsOptions));

app.use(helmet());
app.use(httpLogger);
app.use(express.json());

// Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/courses', authMiddleware, courseRoutes);
app.use('/api/grades', authMiddleware, gradeRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);

// Middleware de gestion d'erreurs
app.use(errorHandler);

export default app;
