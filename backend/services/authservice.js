const User = require('../dal/mongo/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { getUserRepository } = require('../dal/repositoryFactory');
const { generateResetToken } = require('../utils/token');
const { sendResetEmail } = require('../utils/email');

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });
}

async function register({ name, email, password }) {
  const userRepo = getUserRepository();

  if (await userRepo.findByEmail(email)) {
    throw new Error('User already exists');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepo.create({ name, email, password: hashed });

  const token = generateToken(user);

  return {
    message: 'Registration successful',
    user: {
      _id: user._id || user.id, // support MongoDB or SQL
      name: user.name,
      email: user.email
    },
    token
  };
}

async function login({ email, password }) {
  const userRepo = getUserRepository();

  const user = await userRepo.findByEmail(email);
  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);

  return {
    message: 'Login successful',
    user: {
      _id: user._id || user.id,
      name: user.name,
      email: user.email
    },
    token
  };
}

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Email not registered');

  const token = generateResetToken();
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  const resetLink = `http://localhost:3000/reset-password/${token}`;
  await sendResetEmail(email, resetLink);

  return true;
};

exports.resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error('Invalid or expired token');

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  return true;
};

module.exports = { register, login, generateToken };
