const User = require('./userModel');
const UserRepository = require('../userRepository');

class UserRepositoryMongo extends UserRepository {
  async findById(id) {
    return User.findById(id);
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(data) {
    return User.create(data);
  }
}

module.exports = UserRepositoryMongo;
