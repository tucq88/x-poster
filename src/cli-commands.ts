import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { TwitterClient } from './twitter-client';
import { getTwitterConfig, getEnvPath } from './config';

export class CLICommands {
  private twitterClient: TwitterClient | null = null;

  constructor() {
    try {
      const config = getTwitterConfig();
      this.twitterClient = new TwitterClient(config);
    } catch (error) {
      // Will handle in individual commands
    }
  }

  private ensureClient(): TwitterClient {
    if (!this.twitterClient) {
      throw new Error('Twitter client not initialized. Please run setup first.');
    }
    return this.twitterClient;
  }

  async setup(): Promise<void> {
    console.log(chalk.blue('\n🔧 Setting up X Poster CLI...\n'));

    const envPath = getEnvPath();
    const envExists = fs.existsSync(envPath);

    if (envExists) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: '.env file already exists. Do you want to overwrite it?',
          default: false
        }
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('Setup cancelled.'));
        return;
      }
    }

    const credentials = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Twitter API Key:',
        validate: (input) => input.length > 0 || 'API Key is required'
      },
      {
        type: 'password',
        name: 'apiSecret',
        message: 'Twitter API Secret:',
        validate: (input) => input.length > 0 || 'API Secret is required'
      },
      {
        type: 'input',
        name: 'accessToken',
        message: 'Twitter Access Token:',
        validate: (input) => input.length > 0 || 'Access Token is required'
      },
      {
        type: 'password',
        name: 'accessTokenSecret',
        message: 'Twitter Access Token Secret:',
        validate: (input) => input.length > 0 || 'Access Token Secret is required'
      },
      {
        type: 'input',
        name: 'bearerToken',
        message: 'Twitter Bearer Token (optional):'
      }
    ]);

    const envContent = `# X (Twitter) API Credentials
TWITTER_API_KEY=${credentials.apiKey}
TWITTER_API_SECRET=${credentials.apiSecret}
TWITTER_ACCESS_TOKEN=${credentials.accessToken}
TWITTER_ACCESS_TOKEN_SECRET=${credentials.accessTokenSecret}
${credentials.bearerToken ? `TWITTER_BEARER_TOKEN=${credentials.bearerToken}` : '# TWITTER_BEARER_TOKEN=your_bearer_token_here'}
`;

    fs.writeFileSync(envPath, envContent);

    // Test the credentials
    const spinner = ora('Testing credentials...').start();
    try {
      const config = getTwitterConfig();
      this.twitterClient = new TwitterClient(config);
      const user = await this.twitterClient.verifyCredentials();
      spinner.succeed(`Credentials verified! Authenticated as @${user.data.username}`);
    } catch (error) {
      spinner.fail('Failed to verify credentials. Please check your API keys.');
      throw error;
    }
  }

  async postTweet(): Promise<void> {
    const client = this.ensureClient();

    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Enter your tweet (max 280 characters):',
        validate: (input) => {
          if (input.length === 0) return 'Tweet cannot be empty';
          if (input.length > 280) return 'Tweet too long (max 280 characters)';
          return true;
        }
      }
    ]);

    const spinner = ora('Posting tweet...').start();
    try {
      const result = await client.postTweet(message);
      spinner.succeed(`Tweet posted successfully! ID: ${result.data.id}`);
    } catch (error) {
      spinner.fail('Failed to post tweet');
      throw error;
    }
  }

  async postTweetWithImage(): Promise<void> {
    const client = this.ensureClient();

    const { message, imagePath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Enter your tweet message:',
        validate: (input) => input.length > 0 || 'Message cannot be empty'
      },
      {
        type: 'input',
        name: 'imagePath',
        message: 'Enter image file path:',
        validate: (input) => {
          if (!input) return 'Image path is required';
          if (!fs.existsSync(input)) return 'File does not exist';
          return true;
        }
      }
    ]);

    const spinner = ora('Posting tweet with image...').start();
    try {
      const result = await client.postTweetWithMedia(message, imagePath);
      spinner.succeed(`Tweet with image posted successfully! ID: ${result.data.id}`);
    } catch (error) {
      spinner.fail('Failed to post tweet with image');
      throw error;
    }
  }

  async postThread(): Promise<void> {
    const client = this.ensureClient();

    console.log(chalk.blue('\n📝 Creating a tweet thread...\n'));
    console.log('Enter each tweet in the thread. Type "done" when finished.\n');

    const tweets: string[] = [];
    let tweetNumber = 1;

    while (true) {
      const { tweet } = await inquirer.prompt([
        {
          type: 'input',
          name: 'tweet',
          message: `Tweet ${tweetNumber}:`,
          validate: (input) => {
            if (input.toLowerCase() === 'done' && tweets.length === 0) {
              return 'You need at least one tweet in the thread';
            }
            if (input.length > 280) return 'Tweet too long (max 280 characters)';
            return true;
          }
        }
      ]);

      if (tweet.toLowerCase() === 'done') {
        break;
      }

      tweets.push(tweet);
      tweetNumber++;
    }

    const spinner = ora(`Posting thread (${tweets.length} tweets)...`).start();
    try {
      const results = await client.postThread(tweets);
      spinner.succeed(`Thread posted successfully! ${results.length} tweets posted.`);
    } catch (error) {
      spinner.fail('Failed to post thread');
      throw error;
    }
  }

  async viewRecentTweets(): Promise<void> {
    const client = this.ensureClient();

    const { count } = await inquirer.prompt([
      {
        type: 'number',
        name: 'count',
        message: 'How many recent tweets to show?',
        default: 5,
        validate: (input) => input > 0 && input <= 100 || 'Please enter a number between 1 and 100'
      }
    ]);

    const spinner = ora('Fetching recent tweets...').start();
    try {
      const tweets = await client.getMyTweets(count);
      spinner.succeed(`Found ${tweets.data.data?.length || 0} recent tweets`);

      if (tweets.data.data && tweets.data.data.length > 0) {
        console.log(chalk.blue('\n📋 Your Recent Tweets:\n'));
        tweets.data.data.forEach((tweet, index) => {
          console.log(chalk.cyan(`${index + 1}. `), tweet.text);
          console.log(chalk.gray(`   ID: ${tweet.id} | Created: ${tweet.created_at}\n`));
        });
      } else {
        console.log(chalk.yellow('No recent tweets found.'));
      }
    } catch (error) {
      spinner.fail('Failed to fetch tweets');
      throw error;
    }
  }

  async postQuickTweet(): Promise<void> {
    const client = this.ensureClient();

    const quickTweets = [
      "🚀 Building amazing things one line of code at a time! #coding #tech",
      "💡 Today's debugging session: 99% coffee, 1% actual debugging ☕ #developer",
      "🔥 TypeScript making my code more reliable and my life easier! #typescript",
      "⚡ APIs are the glue that holds the digital world together #api #development",
      "🎯 Clean code isn't just about making it work, it's about making it last #cleancode",
      "🌟 The best error messages are the ones that tell you exactly what went wrong #ux",
      "📚 Learning something new every day keeps the imposter syndrome away! #learning",
      "🔧 Refactoring old code feels like organizing a messy room #refactoring"
    ];

    const { selectedTweet } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTweet',
        message: 'Choose a quick tweet to post:',
        choices: quickTweets.map((tweet, index) => ({
          name: tweet,
          value: tweet
        }))
      }
    ]);

    const spinner = ora('Posting quick tweet...').start();
    try {
      const result = await client.postTweet(selectedTweet);
      spinner.succeed(`Quick tweet posted successfully! ID: ${result.data.id}`);
    } catch (error) {
      spinner.fail('Failed to post quick tweet');
      throw error;
    }
  }

  async checkStatus(): Promise<void> {
    console.log(chalk.blue('\n📊 X Poster CLI Status\n'));

    // Check .env file
    const envPath = getEnvPath();
    const envExists = fs.existsSync(envPath);
    console.log(`${envExists ? '✅' : '❌'} .env file: ${envExists ? 'Found' : 'Not found'}`);

    if (!envExists) {
      console.log(chalk.yellow('\nRun "setup" command to configure your credentials.'));
      return;
    }

    // Check credentials
    try {
      const client = this.ensureClient();
      const spinner = ora('Verifying credentials...').start();
      const user = await client.verifyCredentials();
      spinner.succeed(`✅ Credentials: Valid (authenticated as @${user.data.username})`);
      console.log(`   User ID: ${user.data.id}`);
      console.log(`   Name: ${user.data.name}`);
    } catch (error) {
      console.log('❌ Credentials: Invalid or expired');
      console.log(chalk.yellow('Run "setup" command to reconfigure your credentials.'));
    }
  }
}
