import type { Config } from 'jest';
import nextJest from 'next/jest.js';

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};

module.exports = createJestConfig(config);
