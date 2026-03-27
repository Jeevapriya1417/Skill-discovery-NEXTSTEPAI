import mongoose from 'mongoose';
import fs from 'fs';

// Manually parse .env.local
function getMongoUri() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function checkUser() {
  const uri = getMongoUri();
  if (!uri) {
    console.error('MONGODB_URI not found');
    return;
  }

  try {
    await mongoose.connect(uri);
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String }));
    const user = await User.findOne({ email: 'tester1@gmail.com' });
    if (user) {
      console.log('User found:', user.email);
    } else {
      console.log('User NOT found');
    }
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}

checkUser();
