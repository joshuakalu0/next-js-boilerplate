const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  oauthProvider: String,
  resetPasswordToken: String,
resetPasswordExpires: Date,
  oauthId: String,
  avatarUrl: String, 
  refreshTokens: [String] // 🔐 Store multiple refresh tokens for multi-device login
});

module.exports = mongoose.model('User', userSchema);
