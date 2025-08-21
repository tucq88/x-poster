import { TwitterClient } from '../twitter-client';
import { TwitterConfig } from '../config';

// Mock the twitter-api-v2 module
jest.mock('twitter-api-v2', () => {
  return {
    TwitterApi: jest.fn().mockImplementation(() => ({
      v2: {
        tweet: jest.fn(),
        me: jest.fn(),
        userTimeline: jest.fn(),
      },
      v1: {
        uploadMedia: jest.fn(),
      },
    })),
  };
});

describe('TwitterClient', () => {
  let mockConfig: TwitterConfig;
  let mockTwitterApi: any;
  let client: TwitterClient;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    mockConfig = {
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      accessToken: 'test-access-token',
      accessTokenSecret: 'test-access-token-secret',
      bearerToken: 'test-bearer-token'
    };

    // Get the mocked TwitterApi constructor
    const { TwitterApi } = require('twitter-api-v2');
    mockTwitterApi = {
      v2: {
        tweet: jest.fn(),
        me: jest.fn(),
        userTimeline: jest.fn(),
      },
      v1: {
        uploadMedia: jest.fn(),
      },
    };

    // Make TwitterApi constructor return our mock
    TwitterApi.mockImplementation(() => mockTwitterApi);

    client = new TwitterClient(mockConfig);
  });

  describe('constructor', () => {
    it('should create TwitterApi instance with correct config', () => {
      const { TwitterApi } = require('twitter-api-v2');

      expect(TwitterApi).toHaveBeenCalledWith({
        appKey: 'test-api-key',
        appSecret: 'test-api-secret',
        accessToken: 'test-access-token',
        accessSecret: 'test-access-token-secret',
      });
    });

    it('should create instance successfully', () => {
      expect(client).toBeInstanceOf(TwitterClient);
    });
  });

  describe('postTweet', () => {
    it('should post a tweet successfully', async () => {
      const mockTweetResponse = {
        data: { id: '123456789', text: 'Hello World!' }
      };

      mockTwitterApi.v2.tweet.mockResolvedValue(mockTweetResponse);

      const result = await client.postTweet('Hello World!');

      expect(mockTwitterApi.v2.tweet).toHaveBeenCalledWith('Hello World!');
      expect(result).toEqual(mockTweetResponse);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockError.message = 'Rate limit exceeded';

      mockTwitterApi.v2.tweet.mockRejectedValue(mockError);

      await expect(client.postTweet('Hello World!'))
        .rejects.toThrow('Failed to post tweet: Rate limit exceeded');
    });

    it('should handle 403 errors with detailed message', async () => {
      const mockError: any = new Error('Forbidden');
      mockError.code = 403;
      mockError.message = 'Write access denied';

      mockTwitterApi.v2.tweet.mockRejectedValue(mockError);

      await expect(client.postTweet('Hello World!'))
        .rejects.toThrow('403 Forbidden Error - Possible causes:');
    });

    it('should handle errors with additional data', async () => {
      const mockError: any = new Error('API Error');
      mockError.data = { error: 'Invalid request' };
      mockError.errors = [{ message: 'Tweet too long' }];

      mockTwitterApi.v2.tweet.mockRejectedValue(mockError);

      await expect(client.postTweet('Hello World!'))
        .rejects.toThrow('Failed to post tweet: API Error');
    });
  });

  describe('postTweetWithMedia', () => {
    it('should upload media and post tweet successfully', async () => {
      const mockMediaId = 'media123';
      const mockTweetResponse = {
        data: { id: '123456789', text: 'Hello with image!' }
      };

      mockTwitterApi.v1.uploadMedia.mockResolvedValue(mockMediaId);
      mockTwitterApi.v2.tweet.mockResolvedValue(mockTweetResponse);

      const result = await client.postTweetWithMedia('Hello with image!', '/path/to/image.jpg');

      expect(mockTwitterApi.v1.uploadMedia).toHaveBeenCalledWith('/path/to/image.jpg');
      expect(mockTwitterApi.v2.tweet).toHaveBeenCalledWith({
        text: 'Hello with image!',
        media: { media_ids: [mockMediaId] }
      });
      expect(result).toEqual(mockTweetResponse);
    });

    it('should handle media upload errors', async () => {
      const mockError = new Error('Media upload failed');
      mockTwitterApi.v1.uploadMedia.mockRejectedValue(mockError);

      await expect(client.postTweetWithMedia('Hello with image!', '/path/to/image.jpg'))
        .rejects.toThrow('Failed to post tweet with media: Error: Media upload failed');
    });
  });

  describe('postThread', () => {
    it('should post a thread successfully', async () => {
      const tweets = ['First tweet', 'Second tweet', 'Third tweet'];
      const mockResponses = [
        { data: { id: '111', text: 'First tweet' } },
        { data: { id: '222', text: 'Second tweet' } },
        { data: { id: '333', text: 'Third tweet' } }
      ];

      mockTwitterApi.v2.tweet
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      // Mock setTimeout to avoid delays in tests
      const mockSetTimeout = jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
        callback();
        return {} as any;
      });

      const result = await client.postThread(tweets);

      expect(mockTwitterApi.v2.tweet).toHaveBeenCalledTimes(3);
      expect(mockTwitterApi.v2.tweet).toHaveBeenNthCalledWith(1, { text: 'First tweet' });
      expect(mockTwitterApi.v2.tweet).toHaveBeenNthCalledWith(2, {
        text: 'Second tweet',
        reply: { in_reply_to_tweet_id: '111' }
      });
      expect(mockTwitterApi.v2.tweet).toHaveBeenNthCalledWith(3, {
        text: 'Third tweet',
        reply: { in_reply_to_tweet_id: '222' }
      });
      expect(result).toEqual(mockResponses);

      mockSetTimeout.mockRestore();
    });

    it('should handle thread posting errors', async () => {
      const tweets = ['First tweet', 'Second tweet'];
      mockTwitterApi.v2.tweet
        .mockResolvedValueOnce({ data: { id: '111', text: 'First tweet' } })
        .mockRejectedValueOnce(new Error('Second tweet failed'));

      await expect(client.postThread(tweets))
        .rejects.toThrow('Failed to post thread: Error: Second tweet failed');
    });
  });

  describe('scheduleTweet', () => {
    it('should reject past dates', async () => {
      const pastDate = new Date(Date.now() - 60000);

      await expect(client.scheduleTweet('test', pastDate))
        .rejects.toThrow('Schedule time must be in the future');
    });

    it('should schedule future tweets', async () => {
      const futureDate = new Date(Date.now() + 60000);

      // Mock setTimeout to just verify it was called with correct delay
      const mockSetTimeout = jest.spyOn(global, 'setTimeout').mockImplementation(() => ({} as any));

      await client.scheduleTweet('test', futureDate);

      expect(mockSetTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Number)
      );

      // Verify the delay is approximately correct (within 1 second tolerance)
      const [, delay] = mockSetTimeout.mock.calls[0];
      expect(delay).toBeGreaterThan(59000);
      expect(delay).toBeLessThan(61000);

      mockSetTimeout.mockRestore();
    });
  });

  describe('getMyTweets', () => {
    it('should fetch user tweets successfully', async () => {
      const mockUser = { data: { id: 'user123' } };
      const mockTweets = {
        data: [
          { id: '111', text: 'My first tweet', created_at: '2023-01-01T00:00:00Z' },
          { id: '222', text: 'My second tweet', created_at: '2023-01-02T00:00:00Z' }
        ]
      };

      mockTwitterApi.v2.me.mockResolvedValue(mockUser);
      mockTwitterApi.v2.userTimeline.mockResolvedValue(mockTweets);

      const result = await client.getMyTweets(10);

      expect(mockTwitterApi.v2.me).toHaveBeenCalled();
      expect(mockTwitterApi.v2.userTimeline).toHaveBeenCalledWith('user123', {
        max_results: 10,
        'tweet.fields': ['created_at', 'public_metrics']
      });
      expect(result).toEqual(mockTweets);
    });

    it('should use default max_results when not provided', async () => {
      const mockUser = { data: { id: 'user123' } };
      const mockTweets = { data: [] };

      mockTwitterApi.v2.me.mockResolvedValue(mockUser);
      mockTwitterApi.v2.userTimeline.mockResolvedValue(mockTweets);

      await client.getMyTweets();

      expect(mockTwitterApi.v2.userTimeline).toHaveBeenCalledWith('user123', {
        max_results: 10,
        'tweet.fields': ['created_at', 'public_metrics']
      });
    });

    it('should handle errors when fetching tweets', async () => {
      const mockError = new Error('Failed to fetch user');
      mockTwitterApi.v2.me.mockRejectedValue(mockError);

      await expect(client.getMyTweets())
        .rejects.toThrow('Failed to fetch tweets: Error: Failed to fetch user');
    });
  });

  describe('verifyCredentials', () => {
    it('should verify credentials successfully', async () => {
      const mockUser = {
        data: { id: 'user123', username: 'testuser', name: 'Test User' }
      };

      mockTwitterApi.v2.me.mockResolvedValue(mockUser);

      const result = await client.verifyCredentials();

      expect(mockTwitterApi.v2.me).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should handle credential verification errors', async () => {
      const mockError = new Error('Invalid credentials');
      mockTwitterApi.v2.me.mockRejectedValue(mockError);

      await expect(client.verifyCredentials())
        .rejects.toThrow('Failed to verify credentials: Error: Invalid credentials');
    });
  });
});
