import mongoose from 'mongoose';
import fs from 'fs';

// Manually parse .env.local to avoid dependency issues
function getMongoUri() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function debugConnect() {
  const uri = getMongoUri();
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    return;
  }

  console.log('--- MONGODB CONNECTION DEBUGGER ---');
  console.log('Testing connection...');

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ SUCCESS: Connected to MongoDB!');
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ FAILURE: Could not connect.');
    console.error('Error Code:', err.code);
    console.error('Message:', err.message);
    
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.log('\n--- RECOMMENDED ACTION ---');
      console.log('1. Your computer cannot resolve the MongoDB "SRV" address.');
      console.log('2. TRY THIS: go to your computer Network Settings and set your DNS to 8.8.8.8');
      console.log('3. OR: In MongoDB Atlas, get the connection string for "Node.js version 2.2.12 or later" (this is the long one without +srv).');
    }
  }
  process.exit();
}

debugConnect();
