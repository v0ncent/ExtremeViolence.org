#!/usr/bin/env node

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

// Generate a new AUTH_SECRET
const authSecret = crypto.randomBytes(32).toString('base64');

// Create the .env file content
const envContent = `# Auth.js Configuration
# Generated on ${new Date().toISOString()}
AUTH_SECRET=${authSecret}

# Google OAuth Configuration
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth Configuration (optional)
# Get these from: https://github.com/settings/developers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# NodeMailer Configuration (for contact form)
CONTACT_EMAIL=your-email@gmail.com
CONTACT_EMAIL_PASS=your-gmail-app-password
`;

const envPath = path.join(process.cwd(), '.env');

try {
    // Check if .env already exists
    if (fs.existsSync(envPath)) {
        console.log('⚠️  .env file already exists!');
        console.log('📝 Please update your existing .env file with the new AUTH_SECRET:');
        console.log('');
        console.log(`AUTH_SECRET=${authSecret}`);
        console.log('');
        console.log('🔍 Current AUTH_SECRET length:', authSecret.length, 'characters');
        console.log('✅ This should be exactly 44 characters for proper encryption');
    } else {
        // Create new .env file
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env file with new AUTH_SECRET');
        console.log('');
        console.log('📝 Next steps:');
        console.log('1. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET with your actual values');
        console.log('2. Restart your development server');
        console.log('3. Visit http://localhost:5173/auth-test to verify the setup');
    }
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    console.log('');
    console.log('📝 Please manually create a .env file with:');
    console.log(`AUTH_SECRET=${authSecret}`);
} 