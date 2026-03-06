# 🚀 Deployment Guide - Smart Bus System

Complete deployment guide for all three components of the Smart Bus System.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- ✅ All code is tested locally
- ✅ Environment variables are configured
- ✅ Database schema is finalized
- ✅ API endpoints are working
- ✅ Real-time updates are functional

---

## 1️⃣ Backend Deployment

### Option A: Railway (Recommended)

**Step 1: Prepare for Deployment**

Create `Procfile` in backend/:
```
web: npm start
```

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Step 2: Deploy**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Link to project
railway link

# Add PostgreSQL plugin
railway add postgresql

# Set environment variables
railway variables set PORT=5000
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_production_secret

# Deploy
railway up
```

**Step 3: Setup Database**

```bash
# Get database URL
railway variables

# Connect to PostgreSQL
railway connect postgres

# Run schema
\i src/database/schema.sql

# Or use railway run
railway run npm run db:setup
railway run npm run db:seed
```

**Your backend is now live at:** `https://your-project.railway.app`

---

### Option B: Render

**Step 1: Create `render.yaml`**

```yaml
services:
  - type: web
    name: smart-bus-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: smart-bus-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 5000

databases:
  - name: smart-bus-db
    databaseName: smart_bus_db
    user: smart_bus_user
```

**Step 2: Deploy**

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Blueprint"
4. Connect GitHub repository
5. Render will auto-deploy

**Step 3: Run Migrations**

```bash
# In Render dashboard
# Go to Web Service → Shell
npm run db:setup
npm run db:seed
```

---

### Option C: Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
cd backend
heroku create smart-bus-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# Run migrations
heroku run npm run db:setup
heroku run npm run db:seed
```

---

## 2️⃣ Admin Dashboard Deployment

### Vercel (Recommended for Next.js)

**Step 1: Install Vercel CLI**

```bash
npm i -g vercel
```

**Step 2: Configure for Production**

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-backend-url.railway.app/api",
    "NEXT_PUBLIC_SOCKET_URL": "https://your-backend-url.railway.app",
    "NEXT_PUBLIC_MAPBOX_TOKEN": "@mapbox-token"
  }
}
```

**Step 3: Deploy**

```bash
cd admin-dashboard

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? smart-bus-dashboard
# - Directory? ./
# - Override settings? No

# Production deployment
vercel --prod
```

**Step 4: Add Environment Variables**

```bash
# Via CLI
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend-url.railway.app/api

vercel env add NEXT_PUBLIC_SOCKET_URL production
# Enter: https://your-backend-url.railway.app

# Or via dashboard
# Visit: https://vercel.com/[your-account]/smart-bus-dashboard/settings/environment-variables
```

**Your dashboard is now live at:** `https://smart-bus-dashboard.vercel.app`

---

### Alternative: Netlify

**Step 1: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NEXT_PUBLIC_API_URL = "https://your-backend-url.railway.app/api"
  NEXT_PUBLIC_SOCKET_URL = "https://your-backend-url.railway.app"
```

**Step 2: Deploy**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd admin-dashboard
netlify deploy --prod
```

---

## 3️⃣ Passenger Mobile App Deployment

### Option A: Expo Publish (Quick Demo)

**Step 1: Update app.json**

```json
{
  "expo": {
    "name": "Smart Bus",
    "slug": "smart-bus-passenger",
    "extra": {
      "apiUrl": "https://your-backend-url.railway.app/api",
      "socketUrl": "https://your-backend-url.railway.app",
      "mapboxToken": "your_mapbox_token"
    }
  }
}
```

**Step 2: Publish**

```bash
cd passenger-app

# Login to Expo
expo login

# Publish to Expo
expo publish

# Share via QR code or link
# Link format: exp://exp.host/@your-username/smart-bus-passenger
```

---

### Option B: Build Standalone Apps

**For Android (APK)**

```bash
# Install EAS CLI
npm i -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build APK
eas build --platform android --profile preview

# Download APK when complete
# Share APK file for installation
```

**For iOS (TestFlight)**

```bash
# Configure
eas build:configure

# Build
eas build --platform ios

# Submit to TestFlight
eas submit --platform ios
```

---

### Option C: Classic Expo Build

```bash
cd passenger-app

# Android
expo build:android
# Choose APK or App Bundle
# Download when ready

# iOS
expo build:ios
# Choose archive or simulator
# Download when ready
```

---

## 🔒 Production Security Checklist

### Backend
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure CORS origins
- [ ] Add rate limiting
- [ ] Enable SQL injection protection
- [ ] Add input validation
- [ ] Set secure database password
- [ ] Enable database SSL

### Admin Dashboard
- [ ] Hide API keys from client
- [ ] Use environment variables
- [ ] Enable CSP headers
- [ ] Add authentication
- [ ] Set secure cookies

### Mobile App
- [ ] Use HTTPS URLs only
- [ ] Secure token storage
- [ ] Enable SSL pinning
- [ ] Add biometric auth
- [ ] Obfuscate code

---

## 🌍 Environment Variables Summary

### Backend (Railway/Render/Heroku)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgres://...
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=https://your-dashboard-url.vercel.app
```

### Admin Dashboard (Vercel/Netlify)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx
```

### Passenger App (Expo)
```json
"extra": {
  "apiUrl": "https://your-backend-url.railway.app/api",
  "socketUrl": "https://your-backend-url.railway.app",
  "mapboxToken": "pk.xxxxx"
}
```

---

## 🧪 Testing Production Deployment

### 1. Test Backend API
```bash
curl https://your-backend-url.railway.app/health
curl https://your-backend-url.railway.app/api/buses
```

### 2. Test Socket.io Connection
Open browser console on dashboard:
```javascript
const socket = io('https://your-backend-url.railway.app');
socket.on('connect', () => console.log('Connected!'));
```

### 3. Test Mobile App
- Open app on phone
- Check network tab for API calls
- Verify Socket.io connection
- Test real-time updates

---

## 📊 Monitoring & Logs

### Railway
```bash
# View logs
railway logs

# View database
railway connect postgres
```

### Vercel
```bash
# View logs
vercel logs

# View deployments
vercel ls
```

### Expo
```bash
# View builds
eas build:list

# View submission status
eas submit:list
```

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions for Backend

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
        working-directory: ./backend
      - run: npm test
        working-directory: ./backend
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: smart-bus-api
```

### Vercel for Dashboard

Vercel auto-deploys on git push to main branch.

Configure in `vercel.json`:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

---

## 🎯 Post-Deployment Tasks

1. **Update Mobile App Config**
   - Update API URLs in app.json
   - Republish: `expo publish`

2. **Database Backups**
   ```bash
   # Railway
   railway run pg_dump > backup.sql
   
   # Render
   # Enable automatic backups in dashboard
   ```

3. **Monitor Performance**
   - Set up error tracking (Sentry)
   - Add analytics (Google Analytics)
   - Monitor uptime (UptimeRobot)

4. **SSL Certificates**
   - Railway: Auto-configured
   - Vercel: Auto-configured
   - Render: Auto-configured

---

## 💡 Cost Optimization

### Free Tier Limits

**Railway:**
- $5 free credit/month
- Enough for small demos

**Render:**
- Free tier with limitations
- Spins down after inactivity

**Vercel:**
- Generous free tier
- Perfect for dashboards

**Expo:**
- Free classic builds
- EAS: 30 builds/month free

### Production Costs (Estimated)

- Backend: $5-10/month (Railway/Render)
- Database: Included
- Dashboard: Free (Vercel)
- Mobile App: Free (Expo Publish) or $99/year (Apple Developer)

---

## 🆘 Troubleshooting Deployment

### Backend won't start
```bash
# Check logs
railway logs
# or
heroku logs --tail

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port not set
```

### CORS errors
```env
# Update CORS_ORIGIN in backend
CORS_ORIGIN=https://your-dashboard.vercel.app,https://www.your-domain.com
```

### Mobile app can't connect
```json
// Update app.json
"extra": {
  "apiUrl": "https://your-backend.railway.app/api"  // Must be HTTPS
}
```

### Socket.io not connecting
- Ensure WebSocket support is enabled
- Check firewall rules
- Verify CORS settings
- Use HTTPS URLs

---

## 📞 Support Resources

- **Railway:** https://docs.railway.app/
- **Vercel:** https://vercel.com/docs
- **Render:** https://render.com/docs
- **Expo:** https://docs.expo.dev/
- **Heroku:** https://devcenter.heroku.com/

---

## ✅ Deployment Complete!

Your Smart Bus System is now live:
- ✅ Backend API deployed
- ✅ Admin Dashboard accessible
- ✅ Mobile app published
- ✅ Database migrated
- ✅ Real-time updates working

**Share your demo:**
- Dashboard: `https://your-dashboard.vercel.app`
- Mobile: `exp://exp.host/@username/smart-bus-passenger`
- API: `https://your-backend.railway.app/api`

---

**Built with ❤️ for hackathons worldwide**
