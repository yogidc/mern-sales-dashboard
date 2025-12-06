/**
 * Script to make a user admin
 * 
 * Usage:
 * 1. Make sure MongoDB is running
 * 2. Update the email below with your registered email
 * 3. Run: node make-admin.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Get email from command line argument or prompt
const USER_EMAIL = process.argv[2] || process.env.USER_EMAIL || 'your-email@example.com';

async function makeAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/salesdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get User model
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String,
      role: String,
    }), 'users');

    // Update user to admin
    const result = await User.updateOne(
      { email: USER_EMAIL },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.error(`❌ User with email "${USER_EMAIL}" not found!`);
      console.log('\nAvailable users:');
      const users = await User.find({}, 'email role');
      users.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    } else if (result.modifiedCount === 0) {
      console.log(`✅ User "${USER_EMAIL}" is already an admin`);
    } else {
      console.log(`✅ Successfully made "${USER_EMAIL}" an admin!`);
      console.log('   Please logout and login again to see the changes.');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (USER_EMAIL === 'your-email@example.com' && !process.argv[2]) {
  console.error('❌ Please provide your email as an argument:');
  console.error('   node make-admin.js your-email@example.com');
  console.error('\nOr set USER_EMAIL in backend/.env file');
  process.exit(1);
}

makeAdmin();

