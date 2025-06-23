const session = require('express-session');
const MongoStore = require('connect-mongo');
const pgSession = require('connect-pg-simple')(session);
const MySQLStore = require('express-mysql-session')(session);
const config = require('./index');
const { Pool } = require('pg');
const mysql = require('mysql2/promise');

function createSessionStore(dbType) {
  switch (dbType) {
    case 'mongo':
      return MongoStore.create({
        mongoUrl: config.mongoUri,
        collectionName: 'sessions',
      });

    case 'postgres':
      const pgPool = new Pool({ connectionString: config.postgresUri });
      return new pgSession({ pool: pgPool });

    case 'mysql':
      const mysqlOptions = {
        uri: config.mysqlUri,
      };
      return new MySQLStore(mysqlOptions);

    default:
      throw new Error(`Unsupported DB_TYPE: ${dbType}`);
  }
}

module.exports = createSessionStore;
