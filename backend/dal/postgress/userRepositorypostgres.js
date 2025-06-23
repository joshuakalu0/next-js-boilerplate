const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.POSTGRES_URI });

class UserRepositoryPostgres {
  async create({ name, email, password, oauthProvider, oauthId }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, oauth_provider, oauth_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, password, oauthProvider, oauthId]
    );
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async findByOAuth(oauthId, provider) {
    const result = await pool.query(
      'SELECT * FROM users WHERE oauth_id = $1 AND oauth_provider = $2',
      [oauthId, provider]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async saveRefreshToken(userId, token) {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
      [userId, token]
    );
  }

  async removeRefreshToken(userId, token) {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1 AND token = $2',
      [userId, token]
    );
  }

  async findByRefreshToken(token) {
    const result = await pool.query(
      `SELECT users.* FROM refresh_tokens 
       JOIN users ON users.id = refresh_tokens.user_id 
       WHERE refresh_tokens.token = $1`,
      [token]
    );
    return result.rows[0];
  }
}

module.exports = UserRepositoryPostgres;
