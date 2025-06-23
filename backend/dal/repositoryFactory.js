const config = require('../config');

function getUserRepository() {
  switch (config.dbType) {
    case 'mongo':
      return new (require('./mongo/userRepositoryMongo'))();
    case 'postgres':
      return new (require('./postgres/userRepositoryPostgres'))();
    case 'mysql':
      return new (require('./mysql/userRepositoryMysql'))();
    default:
      throw new Error('Unsupported DB type');
  }
}

module.exports = { getUserRepository };
