// db-update.mjs
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb+srv://jeevapriya1417:Jeeva%402325@jeeva1417.zyvrczm.mongodb.net/SkillDiscovery?retryWrites=true&w=majority";

async function updatePassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    // Hash new password
    const hashedPassword = await bcrypt.hash('Stuinter@123', 12);
    
    // Get users collection without model
    const result = await mongoose.connection.collection('users').updateOne(
      { email: 'stuinter@gmail.com' },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Update result:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

updatePassword();
