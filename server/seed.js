require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Profile = require('./models/Profile');
const data = require('./data/profile.json');

(async () => {
  try {
    await connectDB();
    await Profile.deleteMany({});
    await Profile.create(data);
    console.log('Profile seeded.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
