# Test Suite for X Poster CLI

This directory contains fast, focused unit tests for the X Poster CLI application.

## Test Structure

### Unit Tests

#### `simple-twitter-client.test.ts`
Tests for the `TwitterClient` class focusing on core logic:
- **Constructor**: Verifies proper initialization with Twitter API credentials
- **scheduleTweet()**: Tests date validation and scheduling logic
- **Instance creation**: Basic validation without external dependencies

#### `simple-bot.test.ts`
Tests for the `XBot` class focusing on business logic:
- **Constructor**: Verifies proper initialization
- **postRandomTechTweet()**: Tests tech tweet content validation and hashtag presence
- **postDailyUpdate()**: Tests message formatting logic
- **postMotivationalQuote()**: Tests quote content and emoji validation
- **Random selection**: Tests Math.random usage for content selection

#### `config.test.ts`
Tests for configuration management:
- **getTwitterConfig()**: Tests configuration loading and validation
- **Environment variable handling**: Tests missing and invalid credentials
- **getEnvPath()**: Tests environment file path generation
- **Error handling**: Tests proper error messages for missing credentials

## Test Philosophy

### Fast & Focused
- Tests complete in ~1 second
- No external API calls or complex mocking
- Focus on business logic validation
- Test message formatting, content validation, and configuration logic

## Test Configuration

### `jest.config.js`
- Uses `ts-jest` preset for TypeScript support
- Configured for Node.js environment
- Includes coverage reporting
- Excludes CLI and UI files from coverage
- Sets up test timeout and verbose output

### `setup.ts`
Global test setup file that:
- Mocks console methods to reduce test noise
- Sets up test environment variables
- Configures global test timeouts
- Provides cleanup between tests

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

### Test Coverage

The test suite aims for high coverage of core functionality:
- **TwitterClient**: 100% coverage of all public methods
- **XBot**: 100% coverage of all public methods
- **Config**: 100% coverage of configuration logic

Excluded from coverage:
- CLI interface files (mainly UI logic)
- Debug scripts
- Legacy index file

## Mocking Strategy

### External Dependencies
- **twitter-api-v2**: Fully mocked to avoid real API calls
- **dotenv**: Mocked for environment variable testing
- **console methods**: Mocked to reduce test output noise
- **setTimeout**: Mocked to avoid delays in tests

### Test Data
Tests use realistic mock data that matches Twitter API response formats:
- Tweet objects with proper structure
- User objects with required fields
- Error objects with appropriate error codes

## Test Best Practices

### Isolation
- Each test is isolated with proper setup/teardown
- Mocks are reset between tests
- Environment variables are properly managed

### Realistic Scenarios
- Tests cover both success and failure cases
- Error conditions are thoroughly tested
- Edge cases are included (empty responses, rate limits, etc.)

### Maintainability
- Tests are well-organized and documented
- Mock data is realistic and consistent
- Test names clearly describe what is being tested

## Adding New Tests

When adding new functionality:

1. **Unit Tests**: Add tests for individual methods/functions
2. **Integration Tests**: Add tests for component interactions
3. **Error Handling**: Include tests for error scenarios
4. **Mock Updates**: Update mocks if new dependencies are added

### Test File Naming
- Unit tests: `[module-name].test.ts`
- Integration tests: `integration.test.ts`
- Utility tests: `[utility-name].test.ts`

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle success case', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

## Debugging Tests

### Common Issues
1. **Mock not working**: Ensure mocks are properly reset between tests
2. **Async issues**: Use proper async/await or return promises
3. **Environment variables**: Check test setup for proper env var mocking
4. **Console output**: Remember that console methods are mocked in tests

### Debug Commands
```bash
# Run specific test file
npm test twitter-client.test.ts

# Run specific test case
npm test -- --testNamePattern="should post a tweet successfully"

# Run with verbose output
npm test -- --verbose

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```
