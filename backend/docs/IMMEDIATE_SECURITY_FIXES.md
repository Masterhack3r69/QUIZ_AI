# Immediate Security Fixes Required

## Summary
The current authentication flow has several security vulnerabilities that should be addressed before production deployment. While the OTP verification and auto-login feature works, it needs security hardening.

## Critical Issues & Quick Fixes

### 1. Switch to Secure Auth Routes
**Action:** Replace `auth.routes.js` with `auth.routes.SECURE.js`

The SECURE version includes:
- Shorter token expiration (15 minutes vs 30 days)
- Rate limiting on all endpoints
- Input validation middleware
- MongoDB injection prevention
- Timing attack prevention
- Better error handling

```bash
# Backup current file
cp backend/src/routes/auth.routes.js backend/src/routes/auth.routes.BACKUP.js

# Use secure version
cp backend/src/routes/auth.routes.SECURE.js backend/src/routes/auth.routes.js
```

### 2. Implement Token Refresh Mechanism
**Why:** 15-minute tokens will expire quickly, users shouldn't re-login constantly

**Quick Implementation:**
```javascript
// Add to auth.routes.js
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    const newAccessToken = generateToken(user._id);
    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});
```

### 3. Add Security Headers
**Action:** Install and configure helmet.js

```bash
cd backend
pnpm add helmet
```

```javascript
// In backend/src/server.js or app.js
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

### 4. Add CORS Configuration
**Action:** Properly configure CORS to only allow your frontend

```javascript
// In backend/src/server.js
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 5. Environment Variables Validation
**Action:** Add validation for critical env vars

```javascript
// backend/src/config/validateEnv.js
export function validateEnv() {
  const required = [
    'JWT_SECRET',
    'MONGODB_URI',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASSWORD'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}
```

### 6. Add Token Validation on Frontend
**Status:** ✅ Already implemented in the latest update

The frontend now validates:
- JWT token structure (3 parts)
- User object has required fields (_id, email)

### 7. Sanitize User Input
**Action:** Add express-validator to all routes

```bash
cd backend
pnpm add express-validator
```

Already implemented in `auth.routes.SECURE.js` via validation middleware.

## Production Deployment Checklist

Before deploying to production:

- [ ] Use `auth.routes.SECURE.js` instead of `auth.routes.js`
- [ ] Set strong JWT_SECRET (32+ characters, random)
- [ ] Enable HTTPS only (no HTTP)
- [ ] Configure CORS to only allow your domain
- [ ] Add helmet.js security headers
- [ ] Implement refresh token mechanism
- [ ] Set up monitoring and alerting
- [ ] Enable rate limiting on all endpoints
- [ ] Add audit logging for auth events
- [ ] Test all security measures
- [ ] Review and update .env variables
- [ ] Disable debug/verbose logging
- [ ] Set NODE_ENV=production

## Testing Security

```bash
# Test rate limiting
for i in {1..20}; do curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'; done

# Test OTP expiration
# Wait 10 minutes after receiving OTP, then try to verify

# Test invalid tokens
curl http://localhost:5000/api/protected-route \
  -H "Authorization: Bearer invalid.token.here"
```

## Monitoring Recommendations

Set up alerts for:
- Multiple failed login attempts from same IP
- OTP verification failures
- Token validation failures
- Unusual API usage patterns
- Database connection errors
- Email sending failures

## Next Steps

1. Review and implement fixes above
2. Test thoroughly in development
3. Perform security audit
4. Deploy to staging environment
5. Run penetration tests
6. Deploy to production with monitoring
