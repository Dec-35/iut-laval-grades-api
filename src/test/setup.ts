// Import necessary modules
import { jest } from '@jest/globals';

// Mock the database connection pool
jest.mock('../config/database', () => {
  const pool = {
    query: jest.fn(),
  };
  return { pool };
});

// Mock other global modules if necessary
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Set up any global variables or configurations
process.env.NODE_ENV = 'test';