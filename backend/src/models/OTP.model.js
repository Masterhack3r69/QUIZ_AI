import pool from '../config/postgres.js';

class OTP {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.code = data.code;
    this.expiresAt = data.expires_at;
    this.attempts = data.attempts || 0;
    this.isUsed = data.is_used || false;
    this.createdAt = data.created_at;
  }

  static async findOne({ email }) {
    const result = await pool.query(
      `SELECT * FROM otps 
       WHERE LOWER(email) = LOWER($1) AND is_used = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    return result.rows[0] ? new OTP(result.rows[0]) : null;
  }

  static async create({ email, code, expiresAt }) {
    const result = await pool.query(
      `INSERT INTO otps (email, code, expires_at)
       VALUES (LOWER($1), $2, $3)
       RETURNING *`,
      [email, code, expiresAt]
    );
    return new OTP(result.rows[0]);
  }

  static async invalidateAll(email) {
    await pool.query(
      'UPDATE otps SET is_used = TRUE WHERE LOWER(email) = LOWER($1)',
      [email]
    );
  }

  static async deleteExpired() {
    await pool.query('DELETE FROM otps WHERE expires_at < NOW()');
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  async incrementAttempts() {
    this.attempts += 1;
    await pool.query(
      'UPDATE otps SET attempts = $1 WHERE id = $2',
      [this.attempts, this.id]
    );
  }

  async markAsUsed() {
    this.isUsed = true;
    await pool.query(
      'UPDATE otps SET is_used = TRUE WHERE id = $1',
      [this.id]
    );
  }
}

export default OTP;
