#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import { XBot } from './bot';
import fs from 'fs';
import path from 'path';

interface CLIAnswers {
  action: string;
  tweetText?: string;
  imagePath?: string;
  threadTexts?: string;
  scheduleTime?: string;
  progressUpdate?: string;
  customMessage?: string;
  tweetCount?: number;
}

class XPosterCLI {
  private bot: XBot;

  constructor() {
    this.bot = new XBot();
  }

  private displayHeader() {
    console.clear();
    console.log(
      chalk.cyan(
        figlet.textSync('X POSTER', {
          font: 'Standard',
          horizontalLayout: 'default',
          verticalLayout: 'default'
        })
      )
    );
    console.log(chalk.gray('Interactive CLI for posting to X (Twitter)\n'));
  }

  private async showMainMenu(): Promise<CLIAnswers> {
    return await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: chalk.yellow('What would you like to do?'),
        choices: [
          {
            name: '📝 Post a simple tweet',
            value: 'simple_tweet'
          },
          {
            name: '🖼️  Post tweet with image',
            value: 'tweet_with_image'
          },
          {
            name: '🧵 Post a thread',
            value: 'post_thread'
          },
          {
            name: '⏰ Schedule a tweet',
            value: 'schedule_tweet'
          },
          {
            name: '🚀 Post random tech tweet',
            value: 'random_tech'
          },
          {
            name: '💪 Post motivational quote',
            value: 'motivational_quote'
          },
          {
            name: '📈 Post daily progress update',
            value: 'daily_update'
          },
          {
            name: '📖 View recent tweets',
            value: 'view_recent'
          },
          {
            name: '💬 Custom message',
            value: 'custom_message'
          },
          new inquirer.Separator(),
          {
            name: '❌ Exit',
            value: 'exit'
          }
        ]
      }
    ]);
  }

  private async handleSimpleTweet(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'tweetText',
        message: 'Enter your tweet text:',
        validate: (input: string) => {
          if (input.length === 0) return 'Tweet cannot be empty!';
          if (input.length > 280) return 'Tweet is too long! Maximum 280 characters.';
          return true;
        }
      }
    ]);

    console.log(chalk.blue('📤 Posting tweet...'));
    try {
      const result = await this.bot.tweet(answers.tweetText);
      console.log(chalk.green(`✅ Tweet posted successfully! ID: ${result.data.id}`));
    } catch (error) {
      console.log(chalk.red(`❌ Error posting tweet: ${error}`));
    }
  }

  private async handleTweetWithImage(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'tweetText',
        message: 'Enter your tweet text:',
        validate: (input: string) => {
          if (input.length === 0) return 'Tweet cannot be empty!';
          if (input.length > 280) return 'Tweet is too long! Maximum 280 characters.';
          return true;
        }
      },
      {
        type: 'input',
        name: 'imagePath',
        message: 'Enter the path to your image:',
        validate: (input: string) => {
          if (input.length === 0) return 'Image path cannot be empty!';
          if (!fs.existsSync(input)) return 'File does not exist!';
          const ext = path.extname(input).toLowerCase();
          if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            return 'Unsupported image format! Use: jpg, jpeg, png, gif, webp';
          }
          return true;
        }
      }
    ]);

    console.log(chalk.blue('📤 Posting tweet with image...'));
    try {
      const result = await this.bot.tweetWithImage(answers.tweetText, answers.imagePath);
      console.log(chalk.green(`✅ Tweet with image posted successfully! ID: ${result.data.id}`));
    } catch (error) {
      console.log(chalk.red(`❌ Error posting tweet: ${error}`));
    }
  }

  private async handlePostThread(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'editor',
        name: 'threadTexts',
        message: 'Enter your thread tweets (one per line):',
        validate: (input: string) => {
          if (input.trim().length === 0) return 'Thread cannot be empty!';
          const tweets = input.trim().split('\n').filter((line: string) => line.trim().length > 0);
          if (tweets.length < 2) return 'Thread must have at least 2 tweets!';
          if (tweets.some((tweet: string) => tweet.length > 280)) return 'One or more tweets exceed 280 characters!';
          return true;
        }
      }
    ]);

    const tweets = answers.threadTexts.trim().split('\n').filter((line: string) => line.trim().length > 0);
    console.log(chalk.blue(`📤 Posting thread with ${tweets.length} tweets...`));

    try {
      const results = await this.bot.tweetThread(tweets);
      console.log(chalk.green(`✅ Thread posted successfully! ${results.length} tweets posted.`));
    } catch (error) {
      console.log(chalk.red(`❌ Error posting thread: ${error}`));
    }
  }

  private async handleScheduleTweet(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'tweetText',
        message: 'Enter your tweet text:',
        validate: (input: string) => {
          if (input.length === 0) return 'Tweet cannot be empty!';
          if (input.length > 280) return 'Tweet is too long! Maximum 280 characters.';
          return true;
        }
      },
      {
        type: 'input',
        name: 'scheduleTime',
        message: 'Enter schedule time (YYYY-MM-DD HH:MM):',
        validate: (input: string) => {
          const date = new Date(input);
          if (isNaN(date.getTime())) return 'Invalid date format! Use: YYYY-MM-DD HH:MM';
          if (date <= new Date()) return 'Schedule time must be in the future!';
          return true;
        }
      }
    ]);

    const scheduleDate = new Date(answers.scheduleTime);
    console.log(chalk.blue(`⏰ Scheduling tweet for ${scheduleDate.toLocaleString()}...`));

    try {
      await this.bot.scheduleTweet(answers.tweetText, scheduleDate);
      console.log(chalk.green('✅ Tweet scheduled successfully!'));
    } catch (error) {
      console.log(chalk.red(`❌ Error scheduling tweet: ${error}`));
    }
  }

  private async handleDailyUpdate(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'editor',
        name: 'progressUpdate',
        message: 'Enter your daily progress update:',
        validate: (input: string) => {
          if (input.trim().length === 0) return 'Progress update cannot be empty!';
          return true;
        }
      }
    ]);

    console.log(chalk.blue('📤 Posting daily update...'));
    try {
      const result = await this.bot.postDailyUpdate(answers.progressUpdate.trim());
      console.log(chalk.green(`✅ Daily update posted successfully! ID: ${result.data.id}`));
    } catch (error) {
      console.log(chalk.red(`❌ Error posting update: ${error}`));
    }
  }

  private async handleViewRecent(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'number',
        name: 'tweetCount',
        message: 'How many recent tweets to fetch?',
        default: 10,
        validate: (input: number) => {
          if (input < 1 || input > 100) return 'Please enter a number between 1 and 100!';
          return true;
        }
      }
    ]);

    console.log(chalk.blue('📖 Fetching recent tweets...'));
    try {
      const tweets = await this.bot.getRecentTweets(answers.tweetCount);

      if (tweets.data.data && tweets.data.data.length > 0) {
        console.log(chalk.green(`\n📝 Your last ${tweets.data.data.length} tweets:\n`));
        tweets.data.data.forEach((tweet: any, index: number) => {
          console.log(chalk.cyan(`${index + 1}. `), tweet.text);
          console.log(chalk.gray(`   ID: ${tweet.id} | Created: ${new Date(tweet.created_at).toLocaleString()}\n`));
        });
      } else {
        console.log(chalk.yellow('No recent tweets found.'));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error fetching tweets: ${error}`));
    }
  }

  private async handleCustomMessage(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'editor',
        name: 'customMessage',
        message: 'Enter your custom message:',
        validate: (input: string) => {
          if (input.trim().length === 0) return 'Message cannot be empty!';
          if (input.length > 280) return 'Message is too long! Maximum 280 characters.';
          return true;
        }
      }
    ]);

    console.log(chalk.blue('📤 Posting custom message...'));
    try {
      const result = await this.bot.tweet(answers.customMessage.trim());
      console.log(chalk.green(`✅ Custom message posted successfully! ID: ${result.data.id}`));
    } catch (error) {
      console.log(chalk.red(`❌ Error posting message: ${error}`));
    }
  }

  public async run(): Promise<void> {
    try {
      while (true) {
        this.displayHeader();
        const answers = await this.showMainMenu();

        switch (answers.action) {
          case 'simple_tweet':
            await this.handleSimpleTweet();
            break;
          case 'tweet_with_image':
            await this.handleTweetWithImage();
            break;
          case 'post_thread':
            await this.handlePostThread();
            break;
          case 'schedule_tweet':
            await this.handleScheduleTweet();
            break;
          case 'random_tech':
            console.log(chalk.blue('📤 Posting random tech tweet...'));
            try {
              const result = await this.bot.postRandomTechTweet();
              console.log(chalk.green(`✅ Random tech tweet posted! ID: ${result.data.id}`));
            } catch (error) {
              console.log(chalk.red(`❌ Error: ${error}`));
            }
            break;
          case 'motivational_quote':
            console.log(chalk.blue('📤 Posting motivational quote...'));
            try {
              const result = await this.bot.postMotivationalQuote();
              console.log(chalk.green(`✅ Motivational quote posted! ID: ${result.data.id}`));
            } catch (error) {
              console.log(chalk.red(`❌ Error: ${error}`));
            }
            break;
          case 'daily_update':
            await this.handleDailyUpdate();
            break;
          case 'view_recent':
            await this.handleViewRecent();
            break;
          case 'custom_message':
            await this.handleCustomMessage();
            break;
          case 'exit':
            console.log(chalk.green('\n👋 Thanks for using X Poster CLI! Goodbye!\n'));
            process.exit(0);
            break;
        }

        // Ask if user wants to continue
        const continueAnswer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: 'Do you want to perform another action?',
            default: true
          }
        ]);

        if (!continueAnswer.continue) {
          console.log(chalk.green('\n👋 Thanks for using X Poster CLI! Goodbye!\n'));
          break;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'User force closed the prompt with 0 null undefined') {
        console.log(chalk.yellow('\n\n👋 X Poster CLI interrupted. Goodbye!\n'));
      } else {
        console.log(chalk.red(`\n❌ Unexpected error: ${error}\n`));
      }
      process.exit(0);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 X Poster CLI interrupted. Goodbye!\n'));
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  const cli = new XPosterCLI();
  cli.run().catch((error) => {
    console.error(chalk.red('❌ CLI Error:', error));
    process.exit(1);
  });
}