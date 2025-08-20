# X Poster CLI 🤖

An interactive TypeScript CLI bot for posting to X (Twitter) via API. Features a beautiful command-line interface with menu-driven navigation.

## ✨ Features

- 📝 **Post Simple Tweets** - Quick text posting with character validation
- 🖼️ **Tweet with Images** - Upload and post images with your tweets
- 🧵 **Thread Creation** - Create connected tweet threads automatically
- ⚡ **Quick Tweets** - Pre-written tech/developer tweets for instant posting
- 📋 **Recent Tweets** - View your recent tweet history
- 📊 **Status Check** - Verify credentials and configuration
- 🔧 **Interactive Setup** - Guided credential configuration
- 🎨 **Beautiful UI** - Colorful, intuitive command-line interface

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd x-poster
npm install
```

### 2. Run the CLI

```bash
# Development mode
npm run dev

# Or build and run
npm run build
npm start
```

### 3. First Time Setup

When you first run the CLI, select "🔧 Setup/Configure" to add your Twitter API credentials.

## 📋 CLI Menu Options

When you run the CLI, you'll see an interactive menu with these options:

```
┌─────────────────────────────────────┐
│              X Poster               │
│   Interactive CLI for posting to    │
│          X (Twitter)                │
└─────────────────────────────────────┘

? What would you like to do?
❯ 📝 Post a Tweet
  🖼️  Post Tweet with Image
  🧵 Post a Thread
  ⚡ Post Quick Tweet
  📋 View Recent Tweets
  📊 Check Status
  🔧 Setup/Configure
  ❌ Exit
```

### Menu Actions Explained

- **📝 Post a Tweet**: Enter custom text to tweet (with character validation)
- **🖼️ Post Tweet with Image**: Upload an image along with your tweet
- **🧵 Post a Thread**: Create multiple connected tweets in sequence
- **⚡ Post Quick Tweet**: Choose from pre-written developer/tech tweets
- **📋 View Recent Tweets**: Display your recent tweets with metadata
- **📊 Check Status**: Verify your setup and credentials
- **🔧 Setup/Configure**: Interactive credential configuration
- **❌ Exit**: Gracefully exit the application

## 🔧 Setup & Configuration

### Twitter API Credentials

You'll need these credentials from [developer.twitter.com](https://developer.twitter.com/):

1. **API Key** - Your app's public identifier
2. **API Secret** - Your app's secret key
3. **Access Token** - Your user's access token
4. **Access Token Secret** - Your user's access token secret
5. **Bearer Token** (optional) - For read-only operations

### Getting Twitter API Access

1. Visit [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project/app
3. Navigate to "Keys and tokens" tab
4. Generate/copy your credentials
5. Use the CLI setup command to configure them

### Environment File

The setup process creates a `.env` file with your credentials:

```env
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

## 🎯 Usage Examples

### Starting the CLI

```bash
npm run dev
```

### Example Flow

1. Run the CLI
2. Select "🔧 Setup/Configure" (first time only)
3. Enter your Twitter API credentials
4. Select "📝 Post a Tweet"
5. Type your message
6. Tweet posted successfully! ✅

### Global Installation (Optional)

```bash
npm run global-install
```

After global installation, you can run:

```bash
x-poster
# or
xpost
```

## 📱 CLI Commands Deep Dive

### Post a Tweet

- Character limit validation (280 chars)
- Real-time feedback
- Success confirmation with tweet ID

### Post Tweet with Image

- File path validation
- Supported formats: JPEG, PNG, GIF, WebP
- Automatic media upload and attachment

### Create Thread

- Add tweets one by one
- Type "done" when finished
- Automatic thread connection
- Rate limiting protection

### Quick Tweets

Choose from pre-written options:

- 🚀 Building amazing things one line of code at a time!
- 💡 Today's debugging session: 99% coffee, 1% actual debugging
- 🔥 TypeScript making my code more reliable and my life easier!
- ⚡ APIs are the glue that holds the digital world together
- 🎯 Clean code isn't just about making it work, it's about making it last
- And more...

### View Recent Tweets

- Configurable count (1-100 tweets)
- Shows tweet text, ID, and creation date
- Clean, readable format

## 📁 Project Structure

```
x-poster/
├── src/
│   ├── cli.ts            # Main CLI interface & menu
│   ├── cli-commands.ts   # Command implementations
│   ├── twitter-client.ts # Twitter API wrapper
│   └── config.ts         # Configuration management
├── dist/                 # Compiled JavaScript (after build)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env                  # Your API credentials (created by setup)
├── .env.example          # Template for credentials
└── README.md             # This file
```

## 🔄 Available Scripts

```bash
npm run dev          # Run in development mode with ts-node
npm run build        # Compile TypeScript to JavaScript
npm start            # Run the compiled CLI
npm run watch        # Watch for changes and recompile
npm run clean        # Clean the dist directory
npm run global-install # Install globally as 'x-poster' command
```

## ⚠️ Rate Limits & Best Practices

### Twitter API Rate Limits

- **Tweets**: 300 per 15-minute window
- **Media uploads**: 500 per 15-minute window
- **User timeline**: 900 per 15-minute window

### Built-in Protections

- 1-second delay between thread tweets
- Error handling for rate limit responses
- Credential validation before operations

## 🛠️ Troubleshooting

### Common Issues

**❌ "Missing required Twitter API credentials"**

- Run the setup command to configure your API keys
- Verify your `.env` file exists and has all required fields

**❌ "Failed to verify credentials"**

- Check that your API keys are correct
- Ensure your Twitter app has the right permissions
- Verify your access tokens haven't expired

**❌ "Failed to post tweet"**

- Check you haven't hit rate limits
- Verify tweet content meets Twitter's guidelines
- Ensure you have posting permissions

**❌ "File does not exist" (for images)**

- Verify the image file path is correct
- Check file permissions
- Ensure image format is supported

### Getting Help

1. Use the "📊 Check Status" command to diagnose issues
2. Check the [Twitter API documentation](https://developer.twitter.com/en/docs/twitter-api)
3. Review the [twitter-api-v2 library docs](https://github.com/plhery/node-twitter-api-v2)

## 🔒 Security Notes

- ✅ Never commit your `.env` file to version control
- ✅ Keep your API keys secure and private
- ✅ Regenerate keys if you suspect they've been compromised
- ✅ Use environment-specific configurations for different deployments

## 📄 License

MIT License - feel free to use and modify as needed!

## 🎉 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy tweeting with style! 🐦✨**

_Built with TypeScript, Inquirer, Chalk, and the Twitter API v2_
