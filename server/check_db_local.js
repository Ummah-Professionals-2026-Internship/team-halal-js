const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mentorship_db';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    const count = await mongoose.connection.db.collection('users').countDocuments();
    console.log('USER_COUNT:', count);
    const users = await mongoose.connection.db.collection('users').find().toArray();
    console.log('USERS:', users.map(u => ({ email: u.email, role: u.role })));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
check();
