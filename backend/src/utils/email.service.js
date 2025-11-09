import nodemailer from 'nodemailer';

/**
 * Create email transporter based on environment configuration
 * @returns {Object} Nodemailer transporter
 */
function createTransporter() {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  };

  return nodemailer.createTransport(config);
}

/**
 * Generate HTML email template for OTP verification
 * @param {string} name - User's name
 * @param {string} code - 6-digit OTP code
 * @returns {string} HTML email content
 */
function generateOTPEmailHTML(name, code) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Quiz AI Account</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          margin: 20px 0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
        }
        .code-container {
          background-color: #fff;
          border: 2px solid #2563eb;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .code {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #2563eb;
          font-family: 'Courier New', monospace;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Quiz AI</h1>
          <p>Verify Your Account</p>
        </div>
        
        <p>Hi ${name},</p>
        
        <p>Thank you for registering with Quiz AI! To complete your registration, please use the verification code below:</p>
        
        <div class="code-container">
          <div class="code">${code}</div>
        </div>
        
        <p><strong>This code will expire in 10 minutes.</strong></p>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Quiz AI staff will never ask for your verification code.
        </div>
        
        <p>If you didn't request this code, please ignore this email.</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Quiz AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email for OTP verification
 * @param {string} name - User's name
 * @param {string} code - 6-digit OTP code
 * @returns {string} Plain text email content
 */
function generateOTPEmailText(name, code) {
  return `
Hi ${name},

Thank you for registering with Quiz AI!

Your verification code is: ${code}

This code will expire in 10 minutes.

SECURITY NOTICE: Never share this code with anyone. Quiz AI staff will never ask for your verification code.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} Quiz AI. All rights reserved.
  `.trim();
}

/**
 * Send OTP verification email
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit OTP code
 * @param {string} name - User's name
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<void>}
 */
export async function sendOTPEmail(email, code, name, retries = 3) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Quiz AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Quiz AI Account',
    text: generateOTPEmailText(name, code),
    html: generateOTPEmailHTML(name, code)
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP email sent successfully to ${email}`);
      return;
    } catch (error) {
      console.error(`Failed to send OTP email (attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Failed to send OTP email after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * Generate HTML email template for welcome message
 * @param {string} name - User's name
 * @returns {string} HTML email content
 */
function generateWelcomeEmailHTML(name) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Quiz AI</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          margin: 20px 0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
        }
        .success-icon {
          font-size: 48px;
          text-align: center;
          margin: 20px 0;
        }
        .features {
          background-color: #fff;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .feature {
          margin: 15px 0;
          padding-left: 30px;
          position: relative;
        }
        .feature:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
          font-size: 20px;
        }
        .cta {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: #fff;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Quiz AI</h1>
        </div>
        
        <div class="success-icon">🎉</div>
        
        <h2 style="text-align: center; color: #2563eb;">Welcome to Quiz AI, ${name}!</h2>
        
        <p>Your account has been successfully verified. You're now ready to create engaging quizzes powered by AI!</p>
        
        <div class="features">
          <h3>What you can do:</h3>
          <div class="feature">Upload learning materials (PDF, Word, PowerPoint)</div>
          <div class="feature">Generate quizzes automatically with AI</div>
          <div class="feature">Share quizzes with unique access codes</div>
          <div class="feature">Track student performance and analytics</div>
          <div class="feature">Export results to PDF or Excel</div>
        </div>
        
        <div class="cta">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
            Go to Dashboard
          </a>
        </div>
        
        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Quiz AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text welcome email
 * @param {string} name - User's name
 * @returns {string} Plain text email content
 */
function generateWelcomeEmailText(name) {
  return `
Welcome to Quiz AI, ${name}!

Your account has been successfully verified. You're now ready to create engaging quizzes powered by AI!

What you can do:
✓ Upload learning materials (PDF, Word, PowerPoint)
✓ Generate quizzes automatically with AI
✓ Share quizzes with unique access codes
✓ Track student performance and analytics
✓ Export results to PDF or Excel

Get started: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard

If you have any questions or need assistance, feel free to reach out to our support team.

© ${new Date().getFullYear()} Quiz AI. All rights reserved.
  `.trim();
}

/**
 * Send welcome email after successful verification
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<void>}
 */
export async function sendWelcomeEmail(email, name, retries = 3) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Quiz AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Quiz AI - Account Verified!',
    text: generateWelcomeEmailText(name),
    html: generateWelcomeEmailHTML(name)
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${email}`);
      return;
    } catch (error) {
      console.error(`Failed to send welcome email (attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        // Don't throw error for welcome email - it's not critical
        console.error(`Failed to send welcome email after ${retries} attempts`);
        return;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
