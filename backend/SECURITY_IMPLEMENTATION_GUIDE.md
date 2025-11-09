# Security Implementation Guide

## 🚀 Quick Start - Apply Security Fixes

### Step 1: Immediate Actions (CRITICAL)

#### 1.1 Secure Your Credentials
```bash
# 1. Change all exposed credentials immediately
# - Gmail password
# - Gemini API key
# - JWT secret

# 2. Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# 3. Update .env with new values
# 4. Add .env to .gitignore if not already there
echo ".env" >> .gitignore

# 5. Remove .env from git history (if committed)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# 6. Force push (WARNING: coordinate with team first)
git push origin --force --all
```

#### 1.2 Create .env.example
```bash
cd backend
cp .env .env.example
# Then manually remove sensitive values from .env.example
```

### Step 2: Install Security Dependencies

```bash
cd backend

# Install validation and security packages
npm install express-validator helmet express-mongo-sanitize cors express-rate-limit

# Optional: For better rate limiting with Redis
npm install redis rate-limit-redis
```

### Step 3: Apply Security Middleware

#### 3.1 Update server.js

Add this near the top of your `backend/src/server.js`:

```javascript
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';

// Security headers
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

// MongoDB injection prevention
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Sanitized ${key} in request from ${req.ip}`);
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### Step 4: Update Auth Routes

#### Option A: Gradual Migration (Recommended)

1. Test the new secure routes:
```bash
# Backup current routes
cp backend/src/routes/auth.routes.js backend/src/routes/auth.routes.OLD.js

# Copy secure version
cp backend/src/routes/auth.routes.SECURE.js backend/src/routes/auth.routes.js
```

2. Run tests:
```bash
npm test
```

3. Test manually with Postman/Thunder Client

#### Option B: Manual Updates

Apply changes from `auth.routes.SECURE.js` one by one to your existing file.

### Step 5: Update User Model (Add Token Versioning)

Add to `backend/src/models/User.model.js`:

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  tokenVersion: {
    type: Number,
    default: 0
  }
}, { timestamps: true });
```

### Step 6: Update JWT Middleware

Update `backend/src/middleware/auth.middleware.js`:

```javascript
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check token version (if implemented)
    if (user.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Token invalidated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
```

### Step 7: Environment Variable Validation

Create `backend/src/config/env.validator.js`:

```javascript
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'GEMINI_API_KEY'
];

export function validateEnv() {
  const missing = [];
  
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  console.log('✅ Environment variables validated');
}
```

Add to `backend/src/server.js`:

```javascript
import { validateEnv } from './config/env.validator.js';

// Validate environment before starting server
validateEnv();
```

### Step 8: Add Logging

Create `backend/src/utils/logger.js`:

```javascript
import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export function logSecurityEvent(event, details) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    ...details
  };
  
  const logFile = path.join(logDir, 'security.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  console.log(`🔒 Security Event: ${event}`, details);
}

export function logAuthAttempt(email, success, ip) {
  logSecurityEvent('AUTH_ATTEMPT', {
    email,
    success,
    ip,
    timestamp: new Date().toISOString()
  });
}
```

Use in auth routes:

```javascript
import { logAuthAttempt } from '../utils/logger.js';

// In login route
if (!user || !isValidPassword) {
  logAuthAttempt(email, false, req.ip);
  return res.status(401).json({ message: 'Invalid credentials' });
}

logAuthAttempt(email, true, req.ip);
```

### Step 9: Testing

#### 9.1 Test Password Validation
```bash
# Should fail
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"weak"}'

# Should succeed
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Strong@Pass123"}'
```

#### 9.2 Test Rate Limiting
```bash
# Run this 6 times quickly - 6th should be rate limited
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "\nAttempt $i"
done
```

#### 9.3 Test MongoDB Injection Prevention
```bash
# Should be sanitized
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":"anything"}'
```

### Step 10: Update Frontend

Update `frontend/lib/validations.ts` to match backend requirements:

```typescript
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Invalid email address')
    .max(254, 'Email is too long'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/, 'Password must contain at least one special character')
});
```

## 📋 Verification Checklist

After implementation, verify:

- [ ] .env file is in .gitignore
- [ ] All credentials have been changed
- [ ] JWT_SECRET is strong (64+ characters)
- [ ] Password validation is working (8+ chars, complexity)
- [ ] Rate limiting is active on auth endpoints
- [ ] Input validation is working on all routes
- [ ] MongoDB injection prevention is active
- [ ] Security headers are set (check with browser dev tools)
- [ ] Error messages don't leak sensitive info
- [ ] Logging is working for security events
- [ ] Tests are passing
- [ ] Frontend validation matches backend

## 🔄 Ongoing Maintenance

### Weekly
- Review security logs for suspicious activity
- Check for failed login attempts

### Monthly
- Update dependencies: `npm audit fix`
- Review and rotate API keys if needed
- Check for new security advisories

### Quarterly
- Full security audit
- Penetration testing
- Review and update security policies

## 📞 Support

If you encounter issues:
1. Check logs in `backend/logs/security.log`
2. Review error messages (don't expose to users)
3. Test with curl/Postman before blaming code
4. Check environment variables are set correctly

## 🎯 Priority Order

If you can't implement everything at once:

1. **CRITICAL** (Do immediately):
   - Change exposed credentials
   - Strong JWT secret
   - Add .env to .gitignore

2. **HIGH** (Do this week):
   - Input validation
   - Rate limiting
   - Password requirements

3. **MEDIUM** (Do this month):
   - Security headers
   - Token versioning
   - Logging

4. **LOW** (Nice to have):
   - Advanced monitoring
   - Automated security scans
   - Penetration testing
