require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Incident = require('../src/models/Incident');
const Notification = require('../src/models/Notification');

async function run() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Incident.deleteMany({}), Notification.deleteMany({})]);
  await User.create({
    name: 'Musfiqur',
    email: 'admin@resolveops.local',
    password: 'hello123',
    role: 'admin',
    team: 'Platform',
    isOnCall: true
  });
  console.log('Seed complete. Login: admin@resolveops.local / hello123');
  await mongoose.connection.close();
}
run().catch(err => { console.error(err); process.exit(1); });
