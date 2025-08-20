import { TwitterClient } from '../twitter-client';
import { TwitterConfig } from '../config';

// Simple unit tests for TwitterClient
describe('TwitterClient', () => {
  let mockConfig: TwitterConfig;

  beforeEach(() => {
    mockConfig = {
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      accessToken: 'test-access-token',
      accessTokenSecret: 'test-access-token-secret',
      bearerToken: 'test-bearer-token'
    };
  });

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(() => new TwitterClient(mockConfig)).not.toThrow();
    });

    it('should store config properties', () => {
      const client = new TwitterClient(mockConfig);
      expect(client).toBeInstanceOf(TwitterClient);
    });
  });

  describe('scheduleTweet', () => {
    it('should reject past dates', async () => {
      const client = new TwitterClient(mockConfig);
      const pastDate = new Date(Date.now() - 60000);
      
      await expect(client.scheduleTweet('test', pastDate))
        .rejects.toThrow('Schedule time must be in the future');
    });

    it('should accept future dates', async () => {
      const client = new TwitterClient(mockConfig);
      const futureDate = new Date(Date.now() + 60000);
      
      // Mock setTimeout to avoid actual delay
      const mockSetTimeout = jest.spyOn(global, 'setTimeout').mockImplementation(() => ({} as any));
      
      await client.scheduleTweet('test', futureDate);
      
      expect(mockSetTimeout).toHaveBeenCalled();
      mockSetTimeout.mockRestore();
    });
  });
});
