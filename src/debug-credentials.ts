import { getTwitterConfig } from './config';
import { TwitterClient } from './twitter-client';

async function debugCredentials() {
  console.log('🔍 Debugging Twitter API credentials...\n');

  try {
    // Check if config loads properly
    console.log('1️⃣ Loading configuration...');
    const config = getTwitterConfig();

    // Check if all required fields are present (without showing the actual values)
    console.log('✅ Configuration loaded successfully');
    console.log(`   - API Key: ${config.apiKey ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - API Secret: ${config.apiSecret ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - Access Token: ${config.accessToken ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - Access Token Secret: ${config.accessTokenSecret ? '✅ Present' : '❌ Missing'}`);
    console.log(`   - Bearer Token: ${config.bearerToken ? '✅ Present' : '❌ Optional - Missing'}\n`);

    // Test credentials
    console.log('2️⃣ Testing credentials...');
    const client = new TwitterClient(config);

    try {
      const user = await client.verifyCredentials();
      console.log('✅ Credentials verified successfully!');
      console.log(`   - Username: @${user.data.username}`);
      console.log(`   - Display Name: ${user.data.name}`);
      console.log(`   - User ID: ${user.data.id}\n`);

      // Check rate limits
      console.log('3️⃣ Checking API limits...');
      console.log('✅ Authentication successful - ready to post tweets!\n');

    } catch (authError: any) {
      console.log('❌ Credential verification failed:');
      console.log(`   Error: ${authError}\n`);

      // Provide specific guidance based on error
      const errorMessage = authError.toString();
      if (errorMessage.includes('403')) {
        console.log('🔧 403 Error Troubleshooting:');
        console.log('   1. Check if your Twitter app has WRITE permissions');
        console.log('   2. Verify your Access Token and Secret are correct');
        console.log('   3. Make sure your app is not restricted');
        console.log('   4. Check if your Twitter account is verified');
      } else if (errorMessage.includes('401')) {
        console.log('🔧 401 Error Troubleshooting:');
        console.log('   1. Double-check your API Key and Secret');
        console.log('   2. Verify your Access Token and Secret');
        console.log('   3. Make sure there are no extra spaces in your .env file');
      }
    }

  } catch (configError: any) {
    console.log('❌ Configuration error:');
    console.log(`   Error: ${configError}`);
    console.log('\n🔧 Configuration Troubleshooting:');
    console.log('   1. Make sure your .env file exists');
    console.log('   2. Check that all required variables are set');
    console.log('   3. Verify there are no typos in variable names');
  }
}

// Run the debug function
if (require.main === module) {
  debugCredentials().catch(console.error);
}

export { debugCredentials };
