# Performance Audit Scripts

## Lighthouse Audit

Automated Lighthouse performance audits for the Quiz AI Application.

### Prerequisites

Install the required dependencies:

```bash
pnpm add -D lighthouse chrome-launcher
```

### Usage

#### Development Mode

Run audits against the development server:

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Run audit
pnpm lighthouse
```

#### Production Mode

Run audits against the production build:

```bash
# Build and start production server
pnpm build
pnpm start

# In another terminal, run audit
pnpm lighthouse:prod
```

### What Gets Audited

The script audits the following pages:
- Home page (/)
- Login page (/login)
- Register page (/register)
- Join Quiz page (/join)

### Metrics Measured

**Core Web Vitals:**
- LCP (Largest Contentful Paint) - Target: < 2.5s
- FID (First Input Delay) - Target: < 100ms
- CLS (Cumulative Layout Shift) - Target: < 0.1

**Other Performance Metrics:**
- FCP (First Contentful Paint) - Target: < 1.8s
- TTI (Time to Interactive) - Target: < 3.8s
- TBT (Total Blocking Time) - Target: < 200ms
- SI (Speed Index) - Target: < 3.4s

### Results

Results are saved to `frontend/lighthouse-results/` with timestamps.

Example output:
```
🔍 Auditing: Home (/)
📊 Performance Score: 95/100

Core Web Vitals:
────────────────────────────────────────────────────────────
✅ PASS LCP: 1850ms (target: < 2500ms)
✅ PASS FID: 45ms (target: < 100ms)
✅ PASS CLS: 0.05 (target: < 0.1)
```

### Interpreting Results

- **✅ PASS**: Metric meets the target threshold
- **⚠️ WARN**: Metric is within 1.5x the target (needs improvement)
- **❌ FAIL**: Metric exceeds 1.5x the target (requires optimization)

### Adding More Pages

Edit `lighthouse-audit.js` and add pages to the `PAGES_TO_AUDIT` array:

```javascript
const PAGES_TO_AUDIT = [
  { name: 'Home', url: '/' },
  { name: 'Dashboard', url: '/dashboard' },
  // Add more pages here
];
```

### Troubleshooting

**Error: Chrome not found**
- Install Google Chrome or Chromium
- The script uses `chrome-launcher` which requires Chrome

**Error: Connection refused**
- Ensure the development/production server is running
- Check that the port (3000) is correct

**Error: Timeout**
- Increase timeout in lighthouse config
- Check for slow network or CPU

### CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# Example: GitHub Actions
- name: Run Lighthouse Audit
  run: |
    pnpm build
    pnpm start &
    sleep 10
    pnpm lighthouse:prod
```

### Best Practices

1. **Run audits regularly** - Weekly or before major releases
2. **Test on different networks** - Simulate 3G, 4G conditions
3. **Test on different devices** - Mobile, tablet, desktop
4. **Compare results** - Track performance over time
5. **Set performance budgets** - Fail builds if metrics regress

### Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Optimization Guide](../PERFORMANCE_OPTIMIZATION.md)
