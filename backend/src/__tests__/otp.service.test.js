import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { generateOTP, createOTP, validateOTP, invalidatePreviousOTPs, checkRateLimit } from '../utils/otp.service.js';
import OTP from '../models/OTP.model.js';
import User from '../models/User.model.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await OTP.deleteMany({});
  await User.deleteMany({});
});

describe('OTP Service', () => {
  describe('generateOTP', () => {
    test('should generate a 6-digit code', () => {
      const code = generateOTP();
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    });

    test('should generate different codes on multiple calls', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateOTP());
      }
      // Should have at least 90 unique codes out of 100 (allowing for some collisions)
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe('createOTP', () => {
    test('should create and store OTP with correct fields', async () => {
      const email = 'test@example.com';
      const { code, otp } = await createOTP(email);

      expect(code).toMatch(/^\d{6}$/);
      expect(otp.email).toBe(email.toLowerCase());
      expect(otp.code).toBeDefined();
      expect(otp.code).not.toBe(code); // Should be hashed
      expect(otp.expiresAt).toBeInstanceOf(Date);
      expect(otp.attempts).toBe(0);
      expect(otp.isUsed).toBe(false);
    });

    test('should set expiration to 10 minutes from now', async () => {
      const email = 'test@example.com';
      const beforeCreate = Date.now();
      const { otp } = await createOTP(email);
      const afterCreate = Date.now();

      const expectedExpiry = beforeCreate + 10 * 60 * 1000;
      const actualExpiry = otp.expiresAt.getTime();

      // Allow 1 second tolerance
      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 1000);
      expect(actualExpiry).toBeLessThanOrEqual(afterCreate + 10 * 60 * 1000 + 1000);
    });

    test('should invalidate previous OTPs when creating new one', async () => {
      const email = 'test@example.com';
      
      // Create first OTP
      await createOTP(email);
      
      // Create second OTP
      await createOTP(email);

      // Check that first OTP is marked as used
      const otps = await OTP.find({ email: email.toLowerCase() }).sort({ createdAt: 1 });
      expect(otps.length).toBe(2);
      expect(otps[0].isUsed).toBe(true);
      expect(otps[1].isUsed).toBe(false);
    });
  });

  describe('validateOTP', () => {
    test('should validate correct OTP code', async () => {
      const email = 'test@example.com';
      const { code } = await createOTP(email);

      const result = await validateOTP(email, code);

      expect(result.valid).toBe(true);
      expect(result.otp).toBeDefined();
      expect(result.otp.email).toBe(email.toLowerCase());
    });

    test('should reject incorrect OTP code', async () => {
      const email = 'test@example.com';
      await createOTP(email);

      const result = await validateOTP(email, '000000');

      expect(result.valid).toBe(false);
      expect(result.otp).toBeDefined();
    });

    test('should reject OTP for non-existent email', async () => {
      const result = await validateOTP('nonexistent@example.com', '123456');

      expect(result.valid).toBe(false);
      expect(result.otp).toBeNull();
    });

    test('should reject expired OTP', async () => {
      const email = 'test@example.com';
      const { code } = await createOTP(email);

      // Manually expire the OTP
      await OTP.updateOne(
        { email: email.toLowerCase() },
        { expiresAt: new Date(Date.now() - 1000) }
      );

      const result = await validateOTP(email, code);

      expect(result.valid).toBe(false);
      expect(result.otp).toBeDefined();
      expect(result.otp.isExpired()).toBe(true);
    });

    test('should not validate used OTP', async () => {
      const email = 'test@example.com';
      const { code } = await createOTP(email);

      // Mark OTP as used
      await OTP.updateOne(
        { email: email.toLowerCase() },
        { isUsed: true }
      );

      const result = await validateOTP(email, code);

      expect(result.valid).toBe(false);
      expect(result.otp).toBeNull();
    });
  });

  describe('invalidatePreviousOTPs', () => {
    test('should mark all unused OTPs as used', async () => {
      const email = 'test@example.com';
      
      // Create multiple OTPs
      await createOTP(email);
      await OTP.create({
        email: email.toLowerCase(),
        code: 'hashed123',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false
      });

      await invalidatePreviousOTPs(email);

      const otps = await OTP.find({ email: email.toLowerCase() });
      expect(otps.every(otp => otp.isUsed)).toBe(true);
    });

    test('should not affect OTPs for other emails', async () => {
      const email1 = 'test1@example.com';
      const email2 = 'test2@example.com';
      
      await createOTP(email1);
      await createOTP(email2);

      await invalidatePreviousOTPs(email1);

      const otp1 = await OTP.findOne({ email: email1.toLowerCase() });
      const otp2 = await OTP.findOne({ email: email2.toLowerCase() });

      expect(otp1.isUsed).toBe(true);
      expect(otp2.isUsed).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    test('should return not limited for user with no failed attempts', async () => {
      const email = 'test@example.com';
      await User.create({
        name: 'Test User',
        email,
        password: 'password123',
        failedOTPAttempts: 0
      });

      const result = await checkRateLimit(email);

      expect(result.limited).toBe(false);
      expect(result.user).toBeDefined();
    });

    test('should return not limited for user with less than 5 failed attempts', async () => {
      const email = 'test@example.com';
      await User.create({
        name: 'Test User',
        email,
        password: 'password123',
        failedOTPAttempts: 4
      });

      const result = await checkRateLimit(email);

      expect(result.limited).toBe(false);
      expect(result.user).toBeDefined();
    });

    test('should lock user after 5 failed attempts', async () => {
      const email = 'test@example.com';
      await User.create({
        name: 'Test User',
        email,
        password: 'password123',
        failedOTPAttempts: 5
      });

      const result = await checkRateLimit(email);

      expect(result.limited).toBe(true);
      expect(result.user.otpLockedUntil).toBeDefined();
      expect(result.user.otpLockedUntil.getTime()).toBeGreaterThan(Date.now());
    });

    test('should return limited if user is currently locked', async () => {
      const email = 'test@example.com';
      await User.create({
        name: 'Test User',
        email,
        password: 'password123',
        failedOTPAttempts: 5,
        otpLockedUntil: new Date(Date.now() + 15 * 60 * 1000)
      });

      const result = await checkRateLimit(email);

      expect(result.limited).toBe(true);
      expect(result.user).toBeDefined();
    });

    test('should return not limited if lock has expired', async () => {
      const email = 'test@example.com';
      await User.create({
        name: 'Test User',
        email,
        password: 'password123',
        failedOTPAttempts: 5,
        otpLockedUntil: new Date(Date.now() - 1000) // Expired 1 second ago
      });

      const result = await checkRateLimit(email);

      expect(result.limited).toBe(false);
      expect(result.user).toBeDefined();
    });

    test('should return not limited for non-existent user', async () => {
      const result = await checkRateLimit('nonexistent@example.com');

      expect(result.limited).toBe(false);
      expect(result.user).toBeNull();
    });
  });
});
