import { jest } from '@jest/globals';
import nodemailer from 'nodemailer';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email.service.js';

// Mock nodemailer
jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn()
  }
}));

describe('Email Service', () => {
  let mockSendMail;
  let mockTransporter;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock transporter
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
    mockTransporter = {
      sendMail: mockSendMail
    };
    
    nodemailer.createTransport = jest.fn().mockReturnValue(mockTransporter);
    
    // Set environment variables
    process.env.EMAIL_HOST = 'smtp.test.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@test.com';
    process.env.EMAIL_PASSWORD = 'testpassword';
    process.env.EMAIL_FROM = 'Quiz AI <noreply@quizai.com>';
  });

  describe('sendOTPEmail', () => {
    test('should send OTP email successfully', async () => {
      const email = 'test@example.com';
      const code = '123456';
      const name = 'Test User';

      await sendOTPEmail(email, code, name);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: 'Verify Your Quiz AI Account',
          from: 'Quiz AI <noreply@quizai.com>'
        })
      );

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.text).toContain(code);
      expect(callArgs.text).toContain(name);
      expect(callArgs.html).toContain(code);
      expect(callArgs.html).toContain(name);
    });

    test('should include security warning in email', async () => {
      const email = 'test@example.com';
      const code = '123456';
      const name = 'Test User';

      await sendOTPEmail(email, code, name);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.text.toLowerCase()).toContain('never share');
      expect(callArgs.html.toLowerCase()).toContain('never share');
    });

    test('should include expiration time in email', async () => {
      const email = 'test@example.com';
      const code = '123456';
      const name = 'Test User';

      await sendOTPEmail(email, code, name);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.text).toContain('10 minutes');
      expect(callArgs.html).toContain('10 minutes');
    });

    test('should retry on failure', async () => {
      mockSendMail
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ messageId: 'test-message-id' });

      const email = 'test@example.com';
      const code = '123456';
      const name = 'Test User';

      await sendOTPEmail(email, code, name);

      expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    test('should throw error after max retries', async () => {
      mockSendMail.mockRejectedValue(new Error('Network error'));

      const email = 'test@example.com';
      const code = '123456';
      const name = 'Test User';

      await expect(sendOTPEmail(email, code, name)).rejects.toThrow('Failed to send OTP email after 3 attempts');
      expect(mockSendMail).toHaveBeenCalledTimes(3);
    });
  });

  describe('sendWelcomeEmail', () => {
    test('should send welcome email successfully', async () => {
      const email = 'test@example.com';
      const name = 'Test User';

      await sendWelcomeEmail(email, name);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: 'Welcome to Quiz AI - Account Verified!',
          from: 'Quiz AI <noreply@quizai.com>'
        })
      );

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.text).toContain(name);
      expect(callArgs.html).toContain(name);
    });

    test('should include feature list in welcome email', async () => {
      const email = 'test@example.com';
      const name = 'Test User';

      await sendWelcomeEmail(email, name);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.text.toLowerCase()).toContain('upload');
      expect(callArgs.text.toLowerCase()).toContain('quiz');
      expect(callArgs.html.toLowerCase()).toContain('upload');
      expect(callArgs.html.toLowerCase()).toContain('quiz');
    });

    test('should not throw error on failure (non-critical)', async () => {
      mockSendMail.mockRejectedValue(new Error('Network error'));

      const email = 'test@example.com';
      const name = 'Test User';

      await expect(sendWelcomeEmail(email, name)).resolves.not.toThrow();
      expect(mockSendMail).toHaveBeenCalledTimes(3); // Should still retry
    });
  });
});
