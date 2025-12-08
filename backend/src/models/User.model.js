import pool from '../config/postgres.js';
import bcrypt from 'bcryptjs';

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'teacher';
    this.isVerified = data.is_verified || false;
    this.verifiedAt = data.verified_at;
    this.failedOTPAttempts = data.failed_otp_attempts || 0;
    this.otpLockedUntil = data.otp_locked_until;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    // Alias for compatibility
    this._id = data.id;
  }

  static async findOne({ email }) {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async create({ name, email, password, isVerified = false }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, is_verified)
       VALUES ($1, LOWER($2), $3, $4)
       RETURNING *`,
      [name, email, hashedPassword, isVerified]
    );
    return new User(result.rows[0]);
  }

  async save() {
    // Hash password if it was modified (check if it's not already hashed)
    let passwordToSave = this.password;
    if (this.password && !this.password.startsWith('$2')) {
      passwordToSave = await bcrypt.hash(this.password, 10);
    }

    const result = await pool.query(
      `UPDATE users SET
        name = $1,
        password = $2,
        is_verified = $3,
        verified_at = $4,
        failed_otp_attempts = $5,
        otp_locked_until = $6,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        this.name,
        passwordToSave,
        this.isVerified,
        this.verifiedAt,
        this.failedOTPAttempts,
        this.otpLockedUntil,
        this.id
      ]
    );
    Object.assign(this, new User(result.rows[0]));
    return this;
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  isOTPLocked() {
    if (!this.otpLockedUntil) return false;
    return new Date() < new Date(this.otpLockedUntil);
  }

  resetOTPLock() {
    this.failedOTPAttempts = 0;
    this.otpLockedUntil = null;
  }
}

export default User;
