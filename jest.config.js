module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', 'tests/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/', 
    'src/docs/',
    'src/seeders/',
    'src/utils/unzip.ts',
    'src/server.ts',
    'src/config/initialVariables.ts',
    'src/config/multer.ts',
    'src/config/logger.ts',
    'src/controllers/submission.Controller.ts',
    'src/controllers/user.controller.ts',
    'src/controllers/admin.controller.ts',
  ],
};

  