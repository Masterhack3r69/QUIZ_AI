# Security Analysis - Authentication System

## 🔴 CRITICAL ISSUES

### 1. **Exposed Credentials in .env File**
**Severity:** CRITICAL  
**Location:** `backend/.env`

```env
EMAIL_USER=jdedusma@gmail.com
EMAIL_PASSWORD=chdn kzat qtss bagl
GEMINI_API_KEY=AIzaSyAxPyFDKpqTFMEBS6JkO7leyMKoqdJfKsc
JWT_SECRET=your_jwt_secret_key_here
```

**Issues:**
- Real email credentials are committed to the repository
- Weak JWT secret ("your_jwt_secret_key_here")
- API keys exposed in version control
- Anyone with repo access can read these credentials

**Fix:**
```bash
# 1. Immediately revoke/change all exposed credentials
# 2. Use strong, randomly generated secrets
JWT_SECRET=$(openssl rand -base64 64)

# 3. Add .env to .gitignore (if not already)
echo ".env" >> .gitignore

# 4. Use .env.example for documentation
cp .env .env.example
# Then remove sensitive values from .env.example
```

**Recommended .env.example:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz_ai
JWT_SECRET=generate_with_openssl_rand_base64_64
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM="Quiz AI <noreply@quizai.com>"
```

---

### 2. **Weak Password Requirements**
**Severity:** HIGH  
**Location:** `backend/src/models/User.model.js`, `backend/src/routes/auth.routes.js`

**Current State:**
- Minimum 6 characters only
- No complexity requirements (uppercase, lowercase, numbers, special chars)
- No password strength validation
- No check for common passwords

**Issues:**
- "123456" is a valid password
- "password" is a valid password
- Vulnerable to brute force attacks

**Fix:**
```javascript
// backend/src/utils/password.validator.js
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Common passwords check
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

### 3. **No Input Validation/Sanitization**
**Severity:** HIGH  
**Location:** All routes in `backend/src/routes/`

**Issues:**
- Direct use of `req.body` without validation
- No sanitization of user inputs
- Vulnerable to NoSQL injection
- Vulnerable to XSS attacks
- No type checking

**Example Vulnerable Code:**
```javascript
// auth.routes.js - Line 18
const { name, email, password } = req.body;
// No validation before using these values!
```

**Fix - Use express-validator or Joi:**
```javascript
import { body, validationResult } from 'express-validator';

// Registration validation middleware
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character')
];

// Apply to route
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... rest of code
});
```

---

### 4. **User Enumeration Vulnerability**
**Severity:** MEDIUM  
**Location:** `backend/src/routes/auth.routes.js`

**Issues:**
- Different error messages reveal if email exists
- Attackers can enumerate valid email addresses

**Vulnerable Code:**
```javascript
// Line 21-24
const userExists = await User.findOne({ email });
if (userExists && userExists.isVerified) {
  return res.status(400).json({ message: 'User already exists' });
}

// Line 208-210
const user = await User.findOne({ email });
if (!user || !(await user.comparePassword(password))) {
  return res.status(401).json({ message: 'Invalid email or password' });
}
```

**Issue:** Registration tells you if email exists, login tells you if credentials are wrong.

**Fix:**
```javascript
// Use generic messages
// Registration
if (userExists && userExists.isVerified) {
  return res.status(400).json({ 
    message: 'If this email is not registered, a verification code will be sent.' 
  });
}

// Login - already good, but add timing attack prevention
const user = await User.findOne({ email });
const isValidPassword = user ? await user.comparePassword(password) : false;

// Add constant-time comparison delay
await new Promise(resolve => setTimeout(resolve, 100));

if (!user || !isValidPassword) {
  return res.status(401).json({ message: 'Invalid credentials' });
}
```

---

### 5. **Missing Rate Limiting on Critical Endpoints**
**Severity:** HIGH  
**Location:** All authentication routes

**Issues:**
- No rate limiting on login endpoint (brute force attacks)
- No rate limiting on registration (spam accounts)
- OTP rate limiting only checks after user lookup
- No IP-based rate limiting

**Fix - Use express-rate-limit:**
```javascript
import rateLimit from 'express-rate-limit';

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration rate limiter
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many accounts created, please try again later',
});

// OTP verification rate limiter
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many verification attempts',
});

// Apply to routes
router.post('/login', loginLimiter, async (req, res) => { ... });
router.post('/register', registerLimiter, async (req, res) => { ... });
router.post('/verify-otp', otpLimiter, async (req, res) => { ... });
```

---

### 6. **JWT Token Issues**
**Severity:** MEDIUM  
**Location:** `backend/src/routes/auth.routes.js`, `backend/src/middleware/auth.middleware.js`

**Issues:**
- 30-day expiration is too long
- No token refresh mechanism
- No token revocation/blacklist
- No token rotation on password change
- Tokens remain valid after password change

**Fix:**
```javascript
// Use shorter expiration with refresh tokens
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Add token version to user model
// User.model.js
tokenVersion: {
  type: Number,
  default: 0
}

// Invalidate all tokens on password change
user.tokenVersion += 1;
await user.save();

// Verify token version in middleware
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded.id);
if (user.tokenVersion !== decoded.tokenVersion) {
  return res.status(401).json({ message: 'Token invalidated' });
}
```

---

### 7. **OTP Security Issues**
**Severity:** MEDIUM  
**Location:** `backend/src/utils/otp.service.js`

**Issues:**
- 6-digit OTP has only 1 million combinations
- 10-minute expiration might be too long
- No notification on failed OTP attempts
- Rate limiting only after 5 failed attempts

**Improvements:**
```javascript
// Use 8-digit OTP for better security
export function generateOTP() {
  const code = crypto.randomInt(10000000, 99999999);
  return code.toString();
}

// Reduce expiration to 5 minutes
const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

// Add email notification on suspicious activity
if (user.failedOTPAttempts >= 3) {
  await sendSecurityAlertEmail(user.email, user.name);
}
```

---

### 8. **Missing Security Headers**
**Severity:** MEDIUM  
**Location:** `backend/src/server.js` (not reviewed but likely missing)

**Fix - Use helmet:**
```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

### 9. **Password Change Without Re-authentication**
**Severity:** MEDIUM  
**Location:** `backend/src/routes/auth.routes.js` - Line 269

**Issue:**
- Password change only requires current password
- No email notification
- No session invalidation
- Tokens remain valid after password change

**Fix:**
```javascript
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // ... existing validation ...

    // Update password
    user.password = newPassword;
    user.tokenVersion += 1; // Invalidate all existing tokens
    await user.save();

    // Send email notification
    await sendPasswordChangedEmail(user.email, user.name);

    // Return new token
    const token = generateToken(user._id, user.tokenVersion);

    res.json({ 
      message: 'Password updated successfully',
      token // New token for current session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

---

### 10. **MongoDB Injection Vulnerability**
**Severity:** HIGH  
**Location:** All database queries

**Issue:**
- Direct use of user input in queries
- No sanitization of query parameters

**Vulnerable Example:**
```javascript
const user = await User.findOne({ email }); // email from req.body
```

**Attack Example:**
```json
{
  "email": { "$ne": null },
  "password": "anything"
}
```

**Fix:**
```javascript
// Use mongoose-sanitize
import mongoSanitize from 'express-mongo-sanitize';

app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized ${key} in request`);
  },
}));

// Or manually validate
const email = String(req.body.email).toLowerCase().trim();
if (typeof email !== 'string') {
  return res.status(400).json({ message: 'Invalid email format' });
}
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 11. **No CORS Configuration Review**
- Check CORS settings to ensure only trusted origins
- Avoid using `origin: '*'` in production

### 12. **Error Messages Leak Information**
```javascript
res.status(500).json({ message: error.message });
```
- Exposes internal error details
- Should use generic messages in production

### 13. **No Logging/Monitoring**
- No audit trail for authentication events
- No alerting on suspicious activity
- No logging of failed login attempts

### 14. **Missing Account Lockout**
- Only OTP has lockout mechanism
- Login endpoint has no account lockout after failed attempts

### 15. **No Email Verification Expiry**
- Unverified accounts remain forever (until manual cleanup)
- Should auto-delete after 24-48 hours

---

## 🟢 RECOMMENDATIONS

### 1. **Implement Comprehensive Validation**
```bash
npm install express-validator
```

### 2. **Add Rate Limiting**
```bash
npm install express-rate-limit
```

### 3. **Add Security Middleware**
```bash
npm install helmet express-mongo-sanitize cors
```

### 4. **Implement Proper Logging**
```bash
npm install winston morgan
```

### 5. **Add Password Strength Checker**
```bash
npm install zxcvbn
```

### 6. **Environment Variable Validation**
```javascript
// backend/src/config/env.validator.js
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'EMAIL_USER',
  'EMAIL_PASSWORD'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}
```

---

## 📋 IMMEDIATE ACTION ITEMS

1. ✅ **URGENT:** Change all exposed credentials in .env
2. ✅ **URGENT:** Generate strong JWT_SECRET
3. ✅ **URGENT:** Add .env to .gitignore and remove from git history
4. ⚠️ **HIGH:** Implement input validation on all routes
5. ⚠️ **HIGH:** Add rate limiting to authentication endpoints
6. ⚠️ **HIGH:** Strengthen password requirements
7. ⚠️ **MEDIUM:** Implement token refresh mechanism
8. ⚠️ **MEDIUM:** Add security headers with helmet
9. ⚠️ **MEDIUM:** Implement proper error handling
10. ⚠️ **MEDIUM:** Add comprehensive logging

---

## 🔒 SECURITY CHECKLIST

- [ ] Strong password requirements (8+ chars, complexity)
- [ ] Input validation on all endpoints
- [ ] Rate limiting on authentication routes
- [ ] Secure JWT configuration (short expiry, refresh tokens)
- [ ] Token revocation mechanism
- [ ] Account lockout after failed attempts
- [ ] Security headers (helmet)
- [ ] CORS properly configured
- [ ] MongoDB injection prevention
- [ ] XSS prevention
- [ ] CSRF protection (if using cookies)
- [ ] Secure session management
- [ ] Audit logging
- [ ] Email notifications for security events
- [ ] Environment variables properly secured
- [ ] Secrets rotation policy
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning

---

## 📚 RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
