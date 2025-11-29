require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');
const { connectDB } = require('./db');

const createAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@admin.com';
    const username = 'admin';
    const password = '123123';

    // Check if exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      console.log('Admin user already exists:', existing.username);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username,
      email,
      passwordHash,
      role: 'admin',
      status: 'active',
    });

    console.log('Admin user created successfully:');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password:', password);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
