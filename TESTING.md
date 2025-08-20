# Testing Guide for X Poster CLI

This document provides comprehensive information about testing the X Poster CLI application.

## Test Suite Overview

The test suite includes fast, focused unit tests for all client components:

### Test Files Created

1. **`src/__tests__/simple-twitter-client.test.ts`** - Unit tests for TwitterClient class
2. **`src/__tests__/simple-bot.test.ts`** - Unit tests for XBot class
3. **`src/__tests__/config.test.ts`** - Unit tests for configuration management
4. **`src/__tests__/setup.ts`** - Global test setup and configuration
5. **`jest.config.js`** - Jest configuration file

## Setup Instructions

### 1. Install Test Dependencies

The following dependencies have been added to `package.json`:

```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

Install them using your preferred package manager:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 2. Fix Node.js ICU Library Issues (if encountered)

If you encounter ICU library errors, try these solutions:

```bash
# Option 1: Reinstall Node.js with proper ICU support
brew uninstall node
brew install node

# Option 2: Use Node Version Manager (nvm)
nvm install node
nvm use node

# Option 3: Install ICU library
brew install icu4c
brew link icu4c --force
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

### Advanced Test Commands

```bash
# Run specific test file
npm test twitter-client.test.ts

# Run specific test case
npm test -- --testNamePattern="should post a tweet successfully"

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Test Coverage

The test suite provides focused coverage for core functionality:

### TwitterClient Class
- ✅ Constructor initialization with valid config
- ✅ `scheduleTweet()` - Date validation and scheduling logic
- ✅ Basic instance creation and validation

### XBot Class
- ✅ Constructor initialization
- ✅ `postRandomTechTweet()` - Tech tweet content validation
- ✅ `postDailyUpdate()` - Message formatting logic
- ✅ `postMotivationalQuote()` - Quote content validation
- ✅ Random selection logic testing

### Configuration Management
- ✅ `getTwitterConfig()` - Configuration loading and validation
- ✅ Environment variable handling
- ✅ Missing credential detection
- ✅ Error message formatting
- ✅ `getEnvPath()` - Environment file path generation

### Test Philosophy
- **Fast**: Tests run in ~1 second
- **Focused**: Test business logic, not external dependencies
- **Reliable**: No flaky network calls or complex mocking
- **Maintainable**: Simple, readable test code

## Test Features

### Simplified Approach
- **No Complex Mocking**: Tests focus on business logic, not API interactions
- **Fast Execution**: All tests complete in ~1 second
- **Environment Variables**: Mocked for configuration testing
- **Console Output**: Mocked to reduce test noise
- **Direct Logic Testing**: Test message formatting, validation, and selection logic

### Test Data
- Real tweet content validation
- Message formatting verification
- Configuration validation scenarios

### Coverage Focus
- Business logic validation
- Message content and formatting
- Configuration management
- Error handling for invalid inputs

## Example Test Output

When tests run successfully, you should see output like:

```
 PASS  src/__tests__/config.test.ts
 PASS  src/__tests__/simple-twitter-client.test.ts
 PASS  src/__tests__/simple-bot.test.ts

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        1.089 s
Ran all test suites.

Coverage Summary:
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
All files           |   32.22 |    47.61 |   28.57 |   30.58
 bot.ts             |   27.77 |        0 |   11.11 |   27.77
 config.ts          |     100 |      100 |     100 |     100
 twitter-client.ts  |   15.78 |     9.09 |   22.22 |   16.36
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   ```bash
   npm install
   # or
   rm -rf node_modules package-lock.json && npm install
   ```

2. **TypeScript compilation errors**
   ```bash
   npm run build
   ```

3. **Mock not working properly**
   - Check that mocks are reset between tests
   - Verify mock setup in `beforeEach` blocks

4. **Async test failures**
   - Ensure proper `async/await` usage
   - Check test timeouts in Jest config

### Debug Mode

To debug tests in VS Code:
1. Set breakpoints in test files
2. Run "Debug Jest Tests" configuration
3. Or use Node.js debugger: `node --inspect-brk node_modules/.bin/jest --runInBand`

## Adding New Tests

When adding new functionality:

1. **Create unit tests** for individual methods
2. **Add integration tests** for component interactions
3. **Include error scenarios** for robust testing
4. **Update mocks** if new dependencies are added
5. **Maintain test coverage** above 90%

### Test File Template

```typescript
import { YourClass } from '../your-module';

describe('YourClass', () => {
  let instance: YourClass;

  beforeEach(() => {
    // Setup
    instance = new YourClass();
  });

  describe('yourMethod', () => {
    it('should handle success case', async () => {
      // Test implementation
    });

    it('should handle error case', async () => {
      // Test implementation
    });
  });
});
```

## Continuous Integration

The test suite is designed to work in CI environments:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm run test:ci

- name: Upload coverage
  uses: codecov/codecov-action@v1
  with:
    file: ./coverage/lcov.info
```

## Benefits of This Test Suite

1. **Speed**: Tests complete in ~1 second, enabling rapid development
2. **Reliability**: No flaky network dependencies or complex mocking
3. **Focus**: Tests validate business logic and core functionality
4. **Maintainability**: Simple, readable test code that's easy to update
5. **Documentation**: Tests serve as living documentation of expected behavior

The test suite provides a solid foundation for maintaining and extending the X Poster CLI application with confidence, while keeping the feedback loop fast for developers.
