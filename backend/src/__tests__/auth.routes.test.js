import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import request from 'supertest';
import authRoutes from '../routes/auth.routes.js';
import User from '../models/User.model.js';
import OTP from '../models/OTP.model.js';
import * as otpService from '../utils/otp.service.js';
import * as emailService from '../utils/email.service.js';

let mongoServer;
let app;

// Mock email service
jest.unstable_mockModule('../utils/email.service.js', () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined)
}));

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Setup Express app
  app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  // Set JWT secret for tests
  process.env.JWT_SECRET = 'test-secret-key';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await OTP.deleteMany({});
  jest.clearAllMocks();
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    test('should create unverified user and send OTP', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Verification code sent to your email');
      expect(response.body).toHaveProperty('email', userData.email);

      // Verify user was created as unverified
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
      expect(user.isVerified).toBe(false);
      expect(user.name).toBe(userData.name);

      // Verify OTP was created
      const otp = await OTP.findOne({ email: userData.email.toLowerCase() });
      expect(otp).toBeDefined();
      expect(otp.isUsed).toBe(false);
    });

    test('should reject duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    test('should not return token on registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).not.toHaveProperty('token');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    test('should verify OTP and mark user as verified', async () => {
      // Create unverified user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: false
      });

      // Create OTP
      const { code } = await otpService.createOTP(user.email);

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: user.email, code })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(user.email);

      // Verify user is now verified
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isVerified).toBe(true);
      expect(updatedUser.verifiedAt).toBeDefined();
      expect(updatedUser.failedOTPAttempts).toBe(0);

      // Verify OTP is marked as used
      const otp = await OTP.findOne({ email: user.email.toLowerCase() });
      expect(otp.isUsed).toBe(true);
    });

    test('should reject invalid OTP code', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: false
      });

      await otpService.createOTP(user.email);

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: user.email, code: '000000' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid verification code');

      // Verify failed attempts incremented
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.failedOTPAttempts).toBe(1);
    });

    test('should reject expired OTP', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: false
      });

      const { code } = await otpService.createOTP(user.email);

      // Expire the OTP
      await OTP.updateOne(
        { email: user.email.toLowerCase() },
        { expiresAt: new Date(Date.now() - 1000) }
      );

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: user.email, code })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Verification code has expired');
    });

    test('should enforce rate limiting after 5 failed attempts', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: false,
        failedOTPAttempts: 5
      });

      await otpService.createOTP(user.email);

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: user.email, code: '123456' })
        .expect(429);

      expect(response.body.message).toContain('Too many failed attempts');
    });

    test('should reject already verified user', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: true
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: user.email, code: '123456' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email already verified');
    });

    test('should require email and code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email and code are required');
    });
  });

  describe('POST /api/auth/resend-otp', () => {
    test('should resend OTP and invalidate previous codes', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: false
      });

      // Create first OTP
      await otpService.createOTP(user.email);

      // Wait to avoid cooldown
      await new Promise(resolve => setTimeout(resolve, 1100));

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({ email: user.email })
        .expect(200);

      expect(response.body.message).toContain('New code sent');

      // Verify old OTP is invalidated
      const otps = await OTP.find({ email: user.email.toLowerCase() }).sort({ createdAt: 1 });
      expect(otps.length).toBe(2);
      expect(otps[0].isUsed).toBe(true);
      expect(otps[1].isUsed).toBe(false);
    });

    test('should enforce 60-second cooldown', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: false
      });

      await otpService.createOTP(user.email);

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({ email: user.email })
        .expect(429);

      expect(response.body.message).toContain('Please wait');
      expect(response.body.message).toContain('seconds');
    });

    test('should reject already verified user', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: true
      });

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({ email: user.email })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email already verified');
    });

    test('should require email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email is required');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should reject unverified user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await User.create({
        ...userData,
        isVerified: false
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password })
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Please verify your email address');
      expect(response.body).toHaveProperty('email', userData.email);
    });

    test('should allow verified user to login', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await User.create({
        ...userData,
        isVerified: true,
        verifiedAt: new Date()
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
    });

    test('should reject invalid credentials', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await User.create({
        ...userData,
        isVerified: true
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });
  });
});
