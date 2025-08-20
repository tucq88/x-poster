import { getTwitterConfig, getEnvPath, TwitterConfig } from '../config';
import path from 'path';

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getTwitterConfig', () => {
    it('should return valid config when all required env vars are set', () => {
      process.env.TWITTER_API_KEY = 'test-api-key';
      process.env.TWITTER_API_SECRET = 'test-api-secret';
      process.env.TWITTER_ACCESS_TOKEN = 'test-access-token';
      process.env.TWITTER_ACCESS_TOKEN_SECRET = 'test-access-token-secret';
      process.env.TWITTER_BEARER_TOKEN = 'test-bearer-token';

      const config = getTwitterConfig();

      expect(config).toEqual({
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        accessToken: 'test-access-token',
        accessTokenSecret: 'test-access-token-secret',
        bearerToken: 'test-bearer-token'
      });
    });

    it('should return config without bearer token when not provided', () => {
      process.env.TWITTER_API_KEY = 'test-api-key';
      process.env.TWITTER_API_SECRET = 'test-api-secret';
      process.env.TWITTER_ACCESS_TOKEN = 'test-access-token';
      process.env.TWITTER_ACCESS_TOKEN_SECRET = 'test-access-token-secret';
      delete process.env.TWITTER_BEARER_TOKEN;

      const config = getTwitterConfig();

      expect(config).toEqual({
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        accessToken: 'test-access-token',
        accessTokenSecret: 'test-access-token-secret',
        bearerToken: undefined
      });
    });

    it('should throw error when API key is missing', () => {
      delete process.env.TWITTER_API_KEY;
      process.env.TWITTER_API_SECRET = 'test-api-secret';
      process.env.TWITTER_ACCESS_TOKEN = 'test-access-token';
      process.env.TWITTER_ACCESS_TOKEN_SECRET = 'test-access-token-secret';

      expect(() => getTwitterConfig()).toThrow(
        'Missing required Twitter API credentials: apiKey'
      );
    });

    it('should throw error when API secret is missing', () => {
      process.env.TWITTER_API_KEY = 'test-api-key';
      delete process.env.TWITTER_API_SECRET;
      process.env.TWITTER_ACCESS_TOKEN = 'test-access-token';
      process.env.TWITTER_ACCESS_TOKEN_SECRET = 'test-access-token-secret';

      expect(() => getTwitterConfig()).toThrow(
        'Missing required Twitter API credentials: apiSecret'
      );
    });

    it('should throw error when access token is missing', () => {
      process.env.TWITTER_API_KEY = 'test-api-key';
      process.env.TWITTER_API_SECRET = 'test-api-secret';
      delete process.env.TWITTER_ACCESS_TOKEN;
      process.env.TWITTER_ACCESS_TOKEN_SECRET = 'test-access-token-secret';

      expect(() => getTwitterConfig()).toThrow(
        'Missing required Twitter API credentials: accessToken'
      );
    });

    it('should throw error when access token secret is missing', () => {
      process.env.TWITTER_API_KEY = 'test-api-key';
      process.env.TWITTER_API_SECRET = 'test-api-secret';
      process.env.TWITTER_ACCESS_TOKEN = 'test-access-token';
      delete process.env.TWITTER_ACCESS_TOKEN_SECRET;

      expect(() => getTwitterConfig()).toThrow(
        'Missing required Twitter API credentials: accessTokenSecret'
      );
    });

    it('should throw error when multiple credentials are missing', () => {
      delete process.env.TWITTER_API_KEY;
      delete process.env.TWITTER_API_SECRET;
      process.env.TWITTER_ACCESS_TOKEN = 'test-access-token';
      process.env.TWITTER_ACCESS_TOKEN_SECRET = 'test-access-token-secret';

      expect(() => getTwitterConfig()).toThrow(
        'Missing required Twitter API credentials: apiKey, apiSecret'
      );
    });

    it('should throw error when all credentials are missing', () => {
      delete process.env.TWITTER_API_KEY;
      delete process.env.TWITTER_API_SECRET;
      delete process.env.TWITTER_ACCESS_TOKEN;
      delete process.env.TWITTER_ACCESS_TOKEN_SECRET;

      expect(() => getTwitterConfig()).toThrow(
        'Missing required Twitter API credentials: apiKey, apiSecret, accessToken, accessTokenSecret'
      );
    });

    it('should handle empty string values as missing', () => {
      process.env.TWITTER_API_KEY = '';
      process.env.TWITTER_API_SECRET = 'test-api-secret';
      process.env.TWITTER_ACCESS_TOKEN = 'test-access-token';
      process.env.TWITTER_ACCESS_TOKEN_SECRET = 'test-access-token-secret';

      expect(() => getTwitterConfig()).toThrow(
        'Missing required Twitter API credentials: apiKey'
      );
    });

    it('should include setup instruction in error message', () => {
      delete process.env.TWITTER_API_KEY;

      expect(() => getTwitterConfig()).toThrow(
        /Please check your \.env file or run the setup command/
      );
    });
  });

  describe('getEnvPath', () => {
    it('should return path to .env file in current working directory', () => {
      const expectedPath = path.join(process.cwd(), '.env');
      const actualPath = getEnvPath();

      expect(actualPath).toBe(expectedPath);
    });

    it('should return absolute path', () => {
      const envPath = getEnvPath();
      
      expect(path.isAbsolute(envPath)).toBe(true);
    });

    it('should end with .env', () => {
      const envPath = getEnvPath();
      
      expect(envPath).toMatch(/\.env$/);
    });
  });

  describe('TwitterConfig interface', () => {
    it('should have correct type structure', () => {
      const config: TwitterConfig = {
        apiKey: 'test',
        apiSecret: 'test',
        accessToken: 'test',
        accessTokenSecret: 'test',
        bearerToken: 'test'
      };

      expect(typeof config.apiKey).toBe('string');
      expect(typeof config.apiSecret).toBe('string');
      expect(typeof config.accessToken).toBe('string');
      expect(typeof config.accessTokenSecret).toBe('string');
      expect(typeof config.bearerToken).toBe('string');
    });

    it('should allow bearerToken to be undefined', () => {
      const config: TwitterConfig = {
        apiKey: 'test',
        apiSecret: 'test',
        accessToken: 'test',
        accessTokenSecret: 'test'
      };

      expect(config.bearerToken).toBeUndefined();
    });
  });
});
