# 🚀 VERCEL DEPLOYMENT CHECKLIST

## Pre-Deployment Setup

### 1. Environment Variables on Vercel

Go to **Settings → Environment Variables** in your Vercel project and set:

```env
# Frontend Configuration
VITE_APP_URL=https://yourapp.vercel.app
VITE_API_BASE_URL=https://yourapp-api.huggingface.co
VITE_BACKEND_URL=https://yourapp-api.huggingface.co

# For production
NODE_ENV=production
```

**Where to find these values:**
- `VITE_APP_URL`: Your Vercel project domain (shown on Vercel dashboard)
- `VITE_API_BASE_URL`: Your Hugging Face Spaces backend URL
- `VITE_BACKEND_URL`: Your Hugging Face Spaces backend URL (same as above)

### 2. Backend Hugging Face Spaces Configuration

In your Hugging Face Spaces repository settings, set:

```env
# Frontend domain (for CORS)
VITE_APP_URL=https://yourapp.vercel.app

# Allowed CORS origins
CORS_ORIGIN=https://yourapp.vercel.app,https://*.vercel.app

# Other backend configs
PORT=7860
NODE_ENV=production
JWT_SECRET=your_secret_key
MONGO_URI=your_mongodb_uri
```

---

## Vercel Build Configuration

Your `vite.config.ts` is already optimized. Vercel automatically:
- Runs `npm run build` (Vite build)
- Serves static files from `dist/`
- Handles routing for your React SPA

### Vercel Build Settings

**Build Command:** `npm run build`  
**Output Directory:** `dist`

This is automatically detected - no changes needed!

---

## Testing Before Deployment

### Local Testing

```bash
# 1. Set up .env with production-like values
VITE_APP_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:7860  # Or your actual backend
VITE_BACKEND_URL=http://localhost:7860
NODE_ENV=production

# 2. Build the frontend
npm run build

# 3. Preview the production build locally
npm run preview

# Should run on http://localhost:4173
```

### Verify API Connectivity

Open browser DevTools (F12) and test:

```javascript
// Should work
fetch('/api/products')
  .then(r => r.json())
  .then(console.log)

// Or with absolute URL
fetch('https://yourapp-api.huggingface.co/api/products')
  .then(r => r.json())
  .then(console.log)
```

---

## Deployment Steps

### Option A: Deploy with Git (Recommended)

```bash
# 1. Commit your changes
git add .
git commit -m "Production: Fix environment variables and CORS configuration"

# 2. Push to GitHub (or your Git provider)
git push origin main

# 3. Vercel automatically deploys on push
# Watch deployment progress in Vercel dashboard
```

### Option B: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI (if not already)
npm i -g vercel

# 2. Deploy
vercel

# 3. Follow prompts to link to your project
```

---

## Post-Deployment Verification

### ✅ Checklist

After deployment completes:

- [ ] **Frontend loads** at `https://yourapp.vercel.app`
- [ ] **No console errors** - open DevTools (F12)
- [ ] **API calls work** - navigate to products page, check Network tab
- [ ] **CORS errors gone** - no "CORS: origin not allowed" errors
- [ ] **SEO works** - visit `/sitemap.xml` and `/robots.txt`, see correct domain
- [ ] **WebSocket connects** - check Socket.IO connection in console
- [ ] **Images load** - product images display correctly
- [ ] **Routing works** - all pages load (product detail, checkout, etc.)

### Debug Failed Deployment

**If frontend doesn't load:**
1. Check Vercel build logs for TypeScript/build errors
2. Verify environment variables are set in Vercel Settings
3. Check `dist/` folder is generated correctly

**If API calls fail:**
1. Open DevTools → Network tab
2. Check request URL - should be `https://yourapp-api.huggingface.co/api/...`
3. Check for CORS errors in DevTools Console
4. Verify backend is running on Hugging Face Spaces

**If CORS errors:**
1. Go to Hugging Face Spaces settings
2. Verify `VITE_APP_URL` is set to Vercel domain
3. Verify `CORS_ORIGIN` includes Vercel domain
4. Rebuild Hugging Face Spaces

---

## Key Environment Variables Reference

| Variable | Dev Value | Production Value | Where Used |
|----------|-----------|-------------------|------------|
| `VITE_APP_URL` | `http://localhost:3000` | `https://yourapp.vercel.app` | Backend CORS, SEO routes |
| `VITE_API_BASE_URL` | `` (empty) | `https://yourapp-api.hf.co` | Frontend API calls |
| `VITE_BACKEND_URL` | `http://localhost:7860` | `https://yourapp-api.hf.co` | Vite dev proxy |
| `NODE_ENV` | `development` | `production` | Build optimization |
| `CORS_ORIGIN` | `http://localhost:3000,http://localhost:5173` | `https://yourapp.vercel.app,https://*.vercel.app` | Backend CORS validation |

---

## Common Issues & Fixes

### Issue: "CORS: origin not allowed"

**Cause:** `CORS_ORIGIN` not set on Hugging Face Spaces  
**Fix:**
1. Go to Hugging Face Spaces settings
2. Set `CORS_ORIGIN=https://yourapp.vercel.app,https://*.vercel.app`
3. Rebuild the space

### Issue: API calls return 404

**Cause:** `VITE_API_BASE_URL` pointing to wrong backend  
**Fix:**
1. Check Vercel env vars - `VITE_API_BASE_URL` should be Hugging Face Spaces URL
2. Verify backend is running: `curl https://yourapp-api.hf.co/health`

### Issue: SEO pages show localhost URL

**Cause:** `VITE_APP_URL` not set on backend  
**Fix:**
1. Go to Hugging Face Spaces
2. Set `VITE_APP_URL=https://yourapp.vercel.app`
3. Rebuild

### Issue: WebSocket doesn't connect

**Cause:** CORS not allowing WebSocket upgrades  
**Fix:**
1. Check `CORS_ORIGIN` includes your Vercel domain
2. Verify Socket.IO config in backend includes proper CORS
3. Check browser console for connection errors

---

## Production Monitoring

### Health Check Endpoint

Test your backend is up:
```bash
curl https://yourapp-api.huggingface.co/health
# Should respond: {"status":"ok","time":"..."}
```

### Uptime Robot (Optional)

Monitor your backend:
- **URL:** `https://yourapp-api.huggingface.co/health`
- **Type:** HTTP(s)
- **Check interval:** 5 minutes

---

## Next Steps

1. **Commit code changes**
   ```bash
   git add .
   git commit -m "Production: Environment variables and CORS fixes"
   git push origin main
   ```

2. **Monitor first deployment** - watch Vercel dashboard for build status

3. **Test thoroughly** - verify all functionality works

4. **Set up monitoring** - use Uptime Robot or similar for backend

5. **Document** - share deployment URLs and process with team

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Hugging Face Spaces build logs
3. Check browser DevTools → Console for client-side errors
4. Check browser DevTools → Network for API request failures
