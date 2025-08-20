import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken?: string;
}

export const getTwitterConfig = (): TwitterConfig => {
  const config = {
    apiKey: process.env.TWITTER_API_KEY || '',
    apiSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
  };

  // Validate required credentials
  const requiredFields = ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'];
  const missing = requiredFields.filter(field => !config[field as keyof TwitterConfig]);

  if (missing.length > 0) {
    throw new Error(`Missing required Twitter API credentials: ${missing.join(', ')}\n\nPlease check your .env file or run the setup command.`);
  }

  return config;
};

export const getEnvPath = (): string => {
  return path.join(process.cwd(), '.env');
};
