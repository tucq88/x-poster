import { XBot } from '../bot';

// Mock the dependencies
jest.mock('../config', () => ({
  getTwitterConfig: jest.fn(() => ({
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    accessToken: 'test-access-token',
    accessTokenSecret: 'test-access-token-secret'
  }))
}));

jest.mock('../twitter-client', () => ({
  TwitterClient: jest.fn().mockImplementation(() => ({
    postTweet: jest.fn().mockResolvedValue({ data: { id: '123', text: 'test' } }),
    postTweetWithMedia: jest.fn().mockResolvedValue({ data: { id: '123', text: 'test' } }),
    postThread: jest.fn().mockResolvedValue([{ data: { id: '123', text: 'test' } }]),
    scheduleTweet: jest.fn().mockResolvedValue(undefined),
    getMyTweets: jest.fn().mockResolvedValue({ data: [] }),
    verifyCredentials: jest.fn().mockResolvedValue({ data: { id: 'user123' } })
  }))
}));

describe('XBot', () => {
  let xBot: XBot;
  let mockTwitterClient: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get the mocked TwitterClient constructor
    const { TwitterClient } = require('../twitter-client');
    mockTwitterClient = {
      postTweet: jest.fn().mockResolvedValue({ data: { id: '123', text: 'test' } }),
      postTweetWithMedia: jest.fn().mockResolvedValue({ data: { id: '123', text: 'test' } }),
      postThread: jest.fn().mockResolvedValue([{ data: { id: '123', text: 'test' } }]),
      scheduleTweet: jest.fn().mockResolvedValue(undefined),
      getMyTweets: jest.fn().mockResolvedValue({ data: [] }),
      verifyCredentials: jest.fn().mockResolvedValue({ data: { id: 'user123' } })
    };

    // Make TwitterClient constructor return our mock
    TwitterClient.mockImplementation(() => mockTwitterClient);

    xBot = new XBot();
  });

  describe('constructor', () => {
    it('should create instance successfully', () => {
      expect(xBot).toBeInstanceOf(XBot);
    });

    it('should initialize with proper dependencies', () => {
      const { TwitterClient } = require('../twitter-client');
      const { getTwitterConfig } = require('../config');

      // Verify that the dependencies were called during construction
      expect(getTwitterConfig).toHaveBeenCalled();
      expect(TwitterClient).toHaveBeenCalled();
    });
  });

  describe('tweet', () => {
    it('should post a simple tweet', async () => {
      const message = 'Hello World!';
      const mockResponse = { data: { id: '123', text: message } };

      mockTwitterClient.postTweet.mockResolvedValue(mockResponse);

      const result = await xBot.tweet(message);

      expect(mockTwitterClient.postTweet).toHaveBeenCalledWith(message);
      expect(result).toEqual(mockResponse);
    });

    it('should handle tweet posting errors', async () => {
      const message = 'Hello World!';
      const mockError = new Error('Tweet failed');

      mockTwitterClient.postTweet.mockRejectedValue(mockError);

      await expect(xBot.tweet(message)).rejects.toThrow('Tweet failed');
    });
  });

  describe('tweetWithImage', () => {
    it('should post a tweet with media', async () => {
      const message = 'Check out this image!';
      const imagePath = '/path/to/image.jpg';
      const mockResponse = { data: { id: '123', text: message } };

      mockTwitterClient.postTweetWithMedia.mockResolvedValue(mockResponse);

      const result = await xBot.tweetWithImage(message, imagePath);

      expect(mockTwitterClient.postTweetWithMedia).toHaveBeenCalledWith(message, imagePath);
      expect(result).toEqual(mockResponse);
    });

    it('should handle media tweet posting errors', async () => {
      const message = 'Check out this image!';
      const imagePath = '/path/to/image.jpg';
      const mockError = new Error('Media upload failed');

      mockTwitterClient.postTweetWithMedia.mockRejectedValue(mockError);

      await expect(xBot.tweetWithImage(message, imagePath)).rejects.toThrow('Media upload failed');
    });
  });

  describe('tweetThread', () => {
    it('should post a thread of tweets', async () => {
      const messages = ['First tweet', 'Second tweet', 'Third tweet'];
      const mockResponse = [
        { data: { id: '111', text: 'First tweet' } },
        { data: { id: '222', text: 'Second tweet' } },
        { data: { id: '333', text: 'Third tweet' } }
      ];

      mockTwitterClient.postThread.mockResolvedValue(mockResponse);

      const result = await xBot.tweetThread(messages);

      expect(mockTwitterClient.postThread).toHaveBeenCalledWith(messages);
      expect(result).toEqual(mockResponse);
    });

    it('should handle thread posting errors', async () => {
      const messages = ['First tweet', 'Second tweet'];
      const mockError = new Error('Thread posting failed');

      mockTwitterClient.postThread.mockRejectedValue(mockError);

      await expect(xBot.tweetThread(messages)).rejects.toThrow('Thread posting failed');
    });
  });

  describe('scheduleTweet', () => {
    it('should schedule a tweet for later', async () => {
      const message = 'Scheduled tweet';
      const scheduleDate = new Date(Date.now() + 60000);

      mockTwitterClient.scheduleTweet.mockResolvedValue(undefined);

      const result = await xBot.scheduleTweet(message, scheduleDate);

      expect(mockTwitterClient.scheduleTweet).toHaveBeenCalledWith(message, scheduleDate);
      expect(result).toBeUndefined();
    });

    it('should handle scheduling errors', async () => {
      const message = 'Scheduled tweet';
      const scheduleDate = new Date(Date.now() + 60000);
      const mockError = new Error('Scheduling failed');

      mockTwitterClient.scheduleTweet.mockRejectedValue(mockError);

      await expect(xBot.scheduleTweet(message, scheduleDate)).rejects.toThrow('Scheduling failed');
    });
  });

  describe('getRecentTweets', () => {
    it('should fetch recent tweets with default count', async () => {
      const mockTweets = { data: [{ id: '111', text: 'Recent tweet' }] };

      mockTwitterClient.getMyTweets.mockResolvedValue(mockTweets);

      const result = await xBot.getRecentTweets();

      expect(mockTwitterClient.getMyTweets).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockTweets);
    });

    it('should fetch recent tweets with custom count', async () => {
      const mockTweets = { data: [{ id: '111', text: 'Recent tweet' }] };

      mockTwitterClient.getMyTweets.mockResolvedValue(mockTweets);

      const result = await xBot.getRecentTweets(5);

      expect(mockTwitterClient.getMyTweets).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockTweets);
    });

    it('should handle errors when fetching tweets', async () => {
      const mockError = new Error('Failed to fetch tweets');

      mockTwitterClient.getMyTweets.mockRejectedValue(mockError);

      await expect(xBot.getRecentTweets()).rejects.toThrow('Failed to fetch tweets');
    });
  });

  describe('postRandomTechTweet', () => {
    it('should post a random tech tweet', async () => {
      const mockResponse = { data: { id: '123', text: 'tech tweet' } };
      mockTwitterClient.postTweet.mockResolvedValue(mockResponse);

      // Mock Math.random to control which tweet is selected
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.0); // This will select the first tweet (index 0)

      const result = await xBot.postRandomTechTweet();

      expect(mockTwitterClient.postTweet).toHaveBeenCalledWith(
        "🚀 Building amazing things one line of code at a time! #coding #tech"
      );
      expect(result).toEqual(mockResponse);

      Math.random = originalRandom;
    });

    it('should select different tweets based on random value', async () => {
      const mockResponse = { data: { id: '123', text: 'tech tweet' } };
      mockTwitterClient.postTweet.mockResolvedValue(mockResponse);

      // Mock Math.random to select the second tweet
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.1); // This will select the second tweet (index 1 when multiplied by 10)

      await xBot.postRandomTechTweet();

      expect(mockTwitterClient.postTweet).toHaveBeenCalledWith(
        "💡 Today's debugging session: 99% coffee, 1% actual debugging ☕ #developer"
      );

      Math.random = originalRandom;
    });

    it('should handle errors when posting tech tweets', async () => {
      const mockError = new Error('Tech tweet failed');
      mockTwitterClient.postTweet.mockRejectedValue(mockError);

      await expect(xBot.postRandomTechTweet()).rejects.toThrow('Tech tweet failed');
    });

    it('should always include hashtags in tech tweets', async () => {
      const mockResponse = { data: { id: '123', text: 'tech tweet' } };
      mockTwitterClient.postTweet.mockResolvedValue(mockResponse);

      // Test multiple random selections to ensure all tweets have hashtags
      const originalRandom = Math.random;
      const testCases = [0.0, 0.3, 0.6, 0.9];

      for (const randomValue of testCases) {
        Math.random = jest.fn(() => randomValue);
        mockTwitterClient.postTweet.mockClear();

        await xBot.postRandomTechTweet();

        const calledWith = mockTwitterClient.postTweet.mock.calls[0][0];
        expect(calledWith).toMatch(/#\w+/); // Should contain at least one hashtag
      }

      Math.random = originalRandom;
    });
  });

  describe('postDailyUpdate', () => {
    it('should post a formatted daily update', async () => {
      const progress = 'Fixed bugs and added new features';
      const expectedMessage = `📈 Daily Progress Update:\n\n${progress}\n\n#buildinpublic #progress #coding`;
      const mockResponse = { data: { id: '123', text: expectedMessage } };

      mockTwitterClient.postTweet.mockResolvedValue(mockResponse);

      const result = await xBot.postDailyUpdate(progress);

      expect(mockTwitterClient.postTweet).toHaveBeenCalledWith(expectedMessage);
      expect(result).toEqual(mockResponse);
    });

    it('should format message with proper structure', async () => {
      const progress = 'Completed user authentication';
      mockTwitterClient.postTweet.mockResolvedValue({ data: { id: '123', text: 'test' } });

      await xBot.postDailyUpdate(progress);

      const calledWith = mockTwitterClient.postTweet.mock.calls[0][0];
      expect(calledWith).toContain('📈 Daily Progress Update:');
      expect(calledWith).toContain(progress);
      expect(calledWith).toContain('#buildinpublic');
      expect(calledWith).toContain('#progress');
      expect(calledWith).toContain('#coding');
    });

    it('should handle errors when posting daily updates', async () => {
      const progress = 'Some progress';
      const mockError = new Error('Daily update failed');

      mockTwitterClient.postTweet.mockRejectedValue(mockError);

      await expect(xBot.postDailyUpdate(progress)).rejects.toThrow('Daily update failed');
    });
  });

  describe('postMotivationalQuote', () => {
    it('should post a random motivational quote', async () => {
      const mockResponse = { data: { id: '123', text: 'motivational quote' } };
      mockTwitterClient.postTweet.mockResolvedValue(mockResponse);

      // Mock Math.random to control which quote is selected
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.0); // This will select the first quote (index 0)

      const result = await xBot.postMotivationalQuote();

      expect(mockTwitterClient.postTweet).toHaveBeenCalledWith(
        "💪 'The only way to do great work is to love what you do.' - Steve Jobs"
      );
      expect(result).toEqual(mockResponse);

      Math.random = originalRandom;
    });

    it('should select different quotes based on random value', async () => {
      const mockResponse = { data: { id: '123', text: 'motivational quote' } };
      mockTwitterClient.postTweet.mockResolvedValue(mockResponse);

      // Mock Math.random to select a different quote
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.3); // This will select the third quote (index 2)

      await xBot.postMotivationalQuote();

      expect(mockTwitterClient.postTweet).toHaveBeenCalledWith(
        "🚀 'Code is like humor. When you have to explain it, it's bad.' - Cory House"
      );

      Math.random = originalRandom;
    });

    it('should handle errors when posting motivational quotes', async () => {
      const mockError = new Error('Motivational quote failed');
      mockTwitterClient.postTweet.mockRejectedValue(mockError);

      await expect(xBot.postMotivationalQuote()).rejects.toThrow('Motivational quote failed');
    });

    it('should always include emojis and quotes in motivational tweets', async () => {
      const mockResponse = { data: { id: '123', text: 'motivational quote' } };
      mockTwitterClient.postTweet.mockResolvedValue(mockResponse);

      // Test multiple random selections to ensure all quotes have proper format
      const originalRandom = Math.random;
      const testCases = [0.0, 0.2, 0.5, 0.8];

      for (const randomValue of testCases) {
        Math.random = jest.fn(() => randomValue);
        mockTwitterClient.postTweet.mockClear();

        await xBot.postMotivationalQuote();

        const calledWith = mockTwitterClient.postTweet.mock.calls[0][0];
        expect(calledWith).toMatch(/[💪🌟🚀💡⚡🎯🔥]/); // Should contain emoji
        expect(calledWith).toContain("'"); // Should contain quotes
        expect(calledWith).toContain(" - "); // Should contain attribution
      }

      Math.random = originalRandom;
    });
  });
});
