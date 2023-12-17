import winston from 'winston';
import logger from '../src/config/logger';

describe('logger', () => {
  let consoleOutput: any[] = [];
  const originalError = console.error;
  it('should log error messages correctly', async () => {
    const errorMessage = 'Test error message';
    logger.error(errorMessage);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});
