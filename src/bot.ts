import { TwitterClient } from './twitter-client';
import { getTwitterConfig } from './config';

export class XBot {
  private twitterClient: TwitterClient;

  constructor() {
    const config = getTwitterConfig();
    this.twitterClient = new TwitterClient(config);
  }

  /**
   * Post a simple tweet
   */
  async tweet(message: string) {
    return await this.twitterClient.postTweet(message);
  }

  /**
   * Post a tweet with an image
   */
  async tweetWithImage(message: string, imagePath: string) {
    return await this.twitterClient.postTweetWithMedia(message, imagePath);
  }

  /**
   * Post a thread of tweets
   */
  async tweetThread(messages: string[]) {
    return await this.twitterClient.postThread(messages);
  }

  /**
   * Schedule a tweet for later
   */
  async scheduleTweet(message: string, when: Date) {
    return await this.twitterClient.scheduleTweet(message, when);
  }

  /**
   * Get recent tweets from the account
   */
  async getRecentTweets(count: number = 10) {
    return await this.twitterClient.getMyTweets(count);
  }

  /**
   * Auto-generate and post inspirational/tech tweets
   */
  async postRandomTechTweet() {
    const techTweets = [
      "🚀 Building amazing things one line of code at a time! #coding #tech",
      "💡 Today's debugging session: 99% coffee, 1% actual debugging ☕ #developer",
      "🔥 TypeScript making my code more reliable and my life easier! #typescript",
      "⚡ APIs are the glue that holds the digital world together #api #development",
      "🎯 Clean code isn't just about making it work, it's about making it last #cleancode",
      "🌟 The best error messages are the ones that tell you exactly what went wrong #ux",
      "🛠️ Refactoring is like cleaning your room - painful but so worth it! #refactoring",
      "📱 Mobile-first design isn't just a trend, it's reality #webdev #mobile",
      "🔒 Security isn't a feature, it's a foundation #cybersecurity #development",
      "🎨 Good UI is invisible - users notice when it's bad, not when it's good #ux #design"
    ];

    const randomTweet = techTweets[Math.floor(Math.random() * techTweets.length)];
    return await this.tweet(randomTweet);
  }

  /**
   * Post daily motivation/update
   */
  async postDailyUpdate(progress: string) {
    const message = `📈 Daily Progress Update:\n\n${progress}\n\n#buildinpublic #progress #coding`;
    return await this.tweet(message);
  }

  /**
   * Post a motivational quote
   */
  async postMotivationalQuote() {
    const quotes = [
      "💪 'The only way to do great work is to love what you do.' - Steve Jobs",
      "🌟 'Innovation distinguishes between a leader and a follower.' - Steve Jobs",
      "🚀 'Code is like humor. When you have to explain it, it's bad.' - Cory House",
      "💡 'First, solve the problem. Then, write the code.' - John Johnson",
      "⚡ 'The best way to predict the future is to implement it.' - David Heinemeier Hansson",
      "🎯 'Simplicity is the ultimate sophistication.' - Leonardo da Vinci",
      "🔥 'Make it work, make it right, make it fast.' - Kent Beck"
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return await this.tweet(randomQuote);
  }
}
