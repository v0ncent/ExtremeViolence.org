#!/usr/bin/env node

import crypto from 'crypto';

// Generate a new AUTH_SECRET
const authSecret = crypto.randomBytes(32).toString('base64');

console.log('🔐 Generated new AUTH_SECRET:');
console.log('');
console.log(`AUTH_SECRET=${authSecret}`);
console.log('');
console.log('📝 Copy this line to your .env file');
console.log('');
console.log('⚠️  Note: This will invalidate all existing sessions');
console.log('   Users will need to log in again after you update the AUTH_SECRET'); 