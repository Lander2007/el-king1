# Production-Ready CORS Configuration Guide

## Overview

Your backend now has a robust CORS configuration that:
✅ Allows your production Vercel frontend  
✅ Allows Vercel preview deployments (using wildcard matching)  
✅ Allows local development origins  
✅ Allows headless requests without origin header (UptimeRobot, monitoring, curl)  
✅ Supports credentials for session/cookie-based auth  

## Environment Variables

### For Hugging Face Spaces (Production)

Set these in your Hugging Face Spaces environment variables or `.env` file:

```bash
# Your main frontend domain
VITE_APP_URL=https://yourapp.vercel.app

# Additional origins including preview deployments
CORS_ORIGIN=https://yourapp.vercel.app,https://*.vercel.app,http://localhost:3000,http://localhost:5173
```

### For Local Development

```bash
VITE_APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

### For Testing (curl, Postman, UptimeRobot)

**No origin header is needed!** These tools automatically work because the configuration explicitly allows requests without an origin header.

Test with curl:
```bash
curl -X GET http://your-backend:7860/health
# No Origin header needed - this works!
```

Test from Postman:
- Just hit your endpoint normally
- CORS errors won't occur

UptimeRobot monitoring:
- Your pings will work without any special configuration
- No origin header is sent, which is explicitly allowed

## Key Features

### 1. **Wildcard Pattern Matching**
```javascript
CORS_ORIGIN=https://*.vercel.app
```
This single entry allows:
- `https://myapp.vercel.app`
- `https://preview-abc123.vercel.app`
- Any other Vercel preview deployment

### 2. **No-Origin Requests Always Allowed**
The configuration explicitly allows requests that don't send an Origin header:
```javascript
if (!origin) {
  return callback(null, true); // ALWAYS allowed
}
```

This covers:
- UptimeRobot pings
- Monitoring services
- curl/wget commands
- Same-origin requests from the browser
- Server-to-server requests

### 3. **Credentials & Sessions**
```javascript
credentials: true
```
Enables secure session/cookie handling for your e-commerce platform.

### 4. **Socket.IO Integration**
WebSocket connections use the same origin validation logic.

## Configuration Code Location

**File:** `server/src/index.ts` (lines 26-96)

The configuration includes:
- `buildAllowedOrigins()` - Builds the allowed origins list from env variables
- `isOriginAllowed()` - Checks if an origin matches allowed patterns (with wildcard support)
- CORS options with origin validation callback
- Socket.IO CORS configuration

## Testing Your Configuration

### Test 1: Verify Allowed Origins
After deploying, check the logs:
```
✅ CORS Configuration:
   Allowed Origins: ['https://yourapp.vercel.app', 'https://*.vercel.app', ...]
   Credentials: true
```

### Test 2: Frontend Requests Work
Your Vercel frontend should now load without CORS errors.

### Test 3: Local Development Works
```bash
# From localhost:3000 or localhost:5173
fetch('http://localhost:7860/api/products')
  .then(r => r.json())
  .then(data => console.log(data))
```

### Test 4: UptimeRobot Works
Set up a monitor on your `/health` endpoint:
```
GET http://your-hugging-face-space:7860/health
```
Should respond with 200 OK.

## Environment Variable Setup on Hugging Face Spaces

1. Go to your Hugging Face Spaces repository
2. Click **Settings** → **Repository secrets**
3. Add these secrets:

| Secret Name | Value |
|------------|-------|
| `VITE_APP_URL` | `https://yourapp.vercel.app` |
| `CORS_ORIGIN` | `https://yourapp.vercel.app,https://*.vercel.app` |

Or if using a `.env` file in the root of your repository:

```env
# .env (in repo root, don't commit sensitive data)
VITE_APP_URL=https://yourapp.vercel.app
CORS_ORIGIN=https://yourapp.vercel.app,https://*.vercel.app
NODE_ENV=production
```

## Troubleshooting

### Still Getting CORS Errors?

1. **Check the logs** for the rejected origin:
   ```
   CORS: Rejected request from origin "https://unexpected-origin.com"
   ```

2. **Verify environment variables** are set correctly on Hugging Face Spaces

3. **Clear browser cache** - old CORS preflight responses may be cached

4. **Check if it's a no-origin request** - should always work

5. **Wildcard matching** - make sure your pattern is correct:
   ```
   ✅ https://*.vercel.app  (matches https://preview-abc.vercel.app)
   ✅ https://app.vercel.app (exact match)
   ❌ *.vercel.app           (missing protocol)
   ```

### UptimeRobot Still Not Working?

Your endpoint should be responding even without an origin. If it's not:

1. Verify the backend is running: `GET http://your-space:7860/health`
2. Check backend logs for any errors
3. Ensure the `/health` endpoint exists (it should in your code)

## Production Checklist

- [ ] Set `VITE_APP_URL` to your Vercel domain
- [ ] Set `CORS_ORIGIN` to include production and preview URLs
- [ ] Deploy/rebuild on Hugging Face Spaces
- [ ] Test from your frontend - no CORS errors should appear
- [ ] Test UptimeRobot monitoring endpoint
- [ ] Monitor logs for any rejected origins
- [ ] Set `NODE_ENV=production` in Hugging Face environment

## Summary

Your CORS configuration is now:
- **Flexible**: Supports multiple origins and patterns
- **Secure**: Only allows specified origins (with credentials enabled)
- **Robust**: Handles all edge cases (no-origin, wildcards, Socket.IO)
- **Production-Ready**: Works with Vercel, Hugging Face Spaces, and monitoring services
