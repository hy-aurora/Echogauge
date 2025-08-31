#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 EchoGauge Setup Wizard\n');

const envPath = path.join(process.cwd(), '.env.local');
const envExample = `# EchoGauge Environment Configuration

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# Gemini AI Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_HAS_GEMINI=true

# Clerk Authentication (if using)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Optional: Customize the application
NEXT_PUBLIC_APP_NAME=EchoGauge
NEXT_PUBLIC_APP_DESCRIPTION=AI-powered content analysis and insights
`;

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  try {
    // Check if .env.local already exists
    if (fs.existsSync(envPath)) {
      const overwrite = await question('⚠️  .env.local already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('📝 Setting up environment variables...\n');

    // Get Convex URL
    const convexUrl = await question('Enter your Convex URL (or press Enter to skip): ');
    
    // Get Gemini API Key
    console.log('\n🔑 Gemini API Key Setup:');
    console.log('1. Visit: https://makersuite.google.com/app/apikey');
    console.log('2. Create a new API key');
    console.log('3. Copy the key below\n');
    const geminiKey = await question('Enter your Gemini API key (or press Enter to skip): ');

    // Get Clerk keys (optional)
    const clerkPubKey = await question('Enter your Clerk Publishable Key (or press Enter to skip): ');
    const clerkSecretKey = await question('Enter your Clerk Secret Key (or press Enter to skip): ');

    // Build environment content
    let envContent = envExample;
    
    if (convexUrl) {
      envContent = envContent.replace('your_convex_url_here', convexUrl);
    }
    
    if (geminiKey) {
      envContent = envContent.replace('your_gemini_api_key_here', geminiKey);
    }
    
    if (clerkPubKey) {
      envContent = envContent.replace('your_clerk_publishable_key_here', clerkPubKey);
    }
    
    if (clerkSecretKey) {
      envContent = envContent.replace('your_clerk_secret_key_here', clerkSecretKey);
    }

    // Write .env.local file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Environment setup complete!');
    console.log('📁 Created .env.local file');
    
    if (geminiKey) {
      console.log('🤖 Gemini AI is configured and ready to use');
    } else {
      console.log('⚠️  Gemini AI not configured - will use local analysis only');
      console.log('   To enable AI analysis, add your Gemini API key to .env.local');
    }
    
    console.log('\n🚀 You can now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup();
