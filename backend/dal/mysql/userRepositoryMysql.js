const mysql = require('mysql2/promise');
const db = mysql.createPool({ uri: process.env.MYSQL_URI });

class UserRepositoryMysql {
  async create({ name, email, password, oauthProvider, oauthId }) {
    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, oauth_provider, oauth_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, oauthProvider, oauthId]
    );
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  async findByOAuth(oauthId, provider) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE oauth_id = ? AND oauth_provider = ?',
      [oauthId, provider]
    );
    return rows[0];
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  async saveRefreshToken(userId, token) {
    await db.execute('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)', [userId, token]);
  }

  async removeRefreshToken(userId, token) {
    await db.execute('DELETE FROM refresh_tokens WHERE user_id = ? AND token = ?', [userId, token]);
  }

  async findByRefreshToken(token) {
    const [rows] = await db.execute(
      `SELECT users.* FROM refresh_tokens 
       JOIN users ON users.id = refresh_tokens.user_id 
       WHERE refresh_tokens.token = ?`,
      [token]
    );
    return rows[0];
  }
}

module.exports = UserRepositoryMysql;
