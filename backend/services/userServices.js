// services/userService.js
const { getUserRepository } = require('../dal/repositoryFactory');

const userRepo = getUserRepository();

async function registerUser(userData) {
  return await userRepo.create(userData);
}
