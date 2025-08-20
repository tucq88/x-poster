import { TwitterApi, TweetV2PostTweetResult } from 'twitter-api-v2';
import { TwitterConfig } from './config';

export class TwitterClient {
  private client: TwitterApi;

  constructor(config: TwitterConfig) {
    this.client = new TwitterApi({
      appKey: config.apiKey,
      appSecret: config.apiSecret,
      accessToken: config.accessToken,
      accessSecret: config.accessTokenSecret,
    });
  }

  /**
   * Post a simple text tweet
   */
  async postTweet(text: string): Promise<TweetV2PostTweetResult> {
    try {
      console.log('🔄 Attempting to post tweet...');
      const tweet = await this.client.v2.tweet(text);
      console.log('✅ Tweet posted successfully:', tweet.data.id);
      return tweet;
    } catch (error: any) {
      console.error('❌ Detailed error information:');
      console.error('Error object:', error);

      if (error.data) {
        console.error('Twitter API error data:', error.data);
      }

      if (error.errors) {
        console.error('Twitter API errors:', error.errors);
      }

      // Check for specific error codes
      if (error.code === 403) {
        const detailedMessage = `
❌ 403 Forbidden Error - Possible causes:
1. Your Twitter app doesn't have WRITE permissions
2. Your account may be restricted or suspended
3. The tweet content may violate Twitter policies
4. Rate limit exceeded
5. App permissions need to be regenerated

Original error: ${error.message || error}
        `;
        throw new Error(detailedMessage);
      }

      throw new Error(`Failed to post tweet: ${error.message || error}`);
    }
  }

  /**
   * Post a tweet with media (images)
   */
  async postTweetWithMedia(text: string, mediaPath: string): Promise<TweetV2PostTweetResult> {
    try {
      // Upload media first
      const mediaId = await this.client.v1.uploadMedia(mediaPath);

      // Post tweet with media
      const tweet = await this.client.v2.tweet({
        text,
        media: { media_ids: [mediaId] }
      });

      return tweet;
    } catch (error) {
      throw new Error(`Failed to post tweet with media: ${error}`);
    }
  }

  /**
   * Post a thread (multiple connected tweets)
   */
  async postThread(tweets: string[]): Promise<TweetV2PostTweetResult[]> {
    const results: TweetV2PostTweetResult[] = [];
    let lastTweetId: string | undefined;

    try {
      for (let i = 0; i < tweets.length; i++) {
        const tweetOptions: any = { text: tweets[i] };

        // If not the first tweet, reply to the previous one
        if (lastTweetId) {
          tweetOptions.reply = { in_reply_to_tweet_id: lastTweetId };
        }

        const tweet = await this.client.v2.tweet(tweetOptions);
        results.push(tweet);
        lastTweetId = tweet.data.id;

        // Small delay between tweets to avoid rate limiting
        if (i < tweets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to post thread: ${error}`);
    }
  }

  /**
   * Schedule a tweet (note: requires additional logic for actual scheduling)
   */
  async scheduleTweet(text: string, scheduleTime: Date): Promise<void> {
    const now = new Date();
    const delay = scheduleTime.getTime() - now.getTime();

    if (delay <= 0) {
      throw new Error('Schedule time must be in the future');
    }

    console.log(`📅 Tweet scheduled for: ${scheduleTime.toISOString()}`);

    setTimeout(async () => {
      try {
        await this.postTweet(text);
        console.log('⏰ Scheduled tweet posted successfully');
      } catch (error) {
        console.error('❌ Error posting scheduled tweet:', error);
      }
    }, delay);
  }

  /**
   * Get user's own tweets
   */
  async getMyTweets(maxResults: number = 10) {
    try {
      const me = await this.client.v2.me();
      const tweets = await this.client.v2.userTimeline(me.data.id, {
        max_results: maxResults,
        'tweet.fields': ['created_at', 'public_metrics']
      });

      return tweets;
    } catch (error) {
      throw new Error(`Failed to fetch tweets: ${error}`);
    }
  }

  /**
   * Verify credentials
   */
  async verifyCredentials() {
    try {
      const user = await this.client.v2.me();
      return user;
    } catch (error) {
      throw new Error(`Failed to verify credentials: ${error}`);
    }
  }
}
