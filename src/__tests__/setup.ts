// Global test setup file

// Mock console methods globally to reduce noise in tests
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
});

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
