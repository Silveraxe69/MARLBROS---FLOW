# 🚌 Smart Bus System - Quick Start Guide

Complete setup guide for the hackathon project in **24 hours**.

---

## 📋 Prerequisites

Before starting, ensure you have:

✅ **Node.js** 18+ installed  
✅ **MongoDB** 4.4+ installed and running  
✅ **npm** or **yarn** package manager  
✅ **Expo CLI** for mobile app: `npm install -g expo-cli`  
✅ **Mapbox account** (free tier) for maps  
✅ **Code editor** (VS Code recommended)

---

## 🚀 Full System Setup (15 minutes)

### Step 1: Clone or Navigate to Project

```bash
cd flow-bus-system
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your MongoDB credentials
# MONGODB_URI=mongodb://localhost:27017/smart_bus_db

# Make sure MongoDB is running
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Seed with sample data
npm run db:seed

# Start backend server
npm run dev
```

✅ Backend should now be running on `http://localhost:5000`

---

### Step 3: Passenger Mobile App Setup

```bash
# Navigate to passenger app (new terminal)
cd passenger-app

# Install dependencies
npm install

# Update app.json with your computer's IP address
# Replace YOUR_IP with your actual IP:
# "apiUrl": "http://YOUR_IP:5000/api"
# "socketUrl": "http://YOUR_IP:5000"

# Find your IP:
# Windows: ipconfig
# Mac/Linux: ifconfig

# Start Expo development server
npx expo start
```

✅ Scan QR code with Expo Go app on your phone

---

### Step 3: Admin Dashboard Setup

```bash
# Navigate to admin dashboard (new terminal)
cd admin-dashboard

# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Start development server
npm run dev
```

✅ Dashboard available at `http://localhost:3000`

---

## 🎯 Testing the System

### 1. Backend Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-03-06T...",
  "uptime": 123.45
}
```

### 2. Test Real-time Bus Simulation

Open admin dashboard and you should see:
- Buses updating positions every 5 seconds
- ETA calculations changing
- Live count updating

### 3. Test Passenger App

1. Login with test credentials:
   - Email: `passenger@test.com`
   - Password: `password123`

2. View live buses on map
3. Check stop arrivals
4. Report crowd status

---

## 📊 Project Architecture

```
smart-bus-system/
│
├── backend/                    ← Node.js + Express + Socket.io
│   ├── src/
│   │   ├── controllers/       ← Request handlers
│   │   ├── routes/            ← API routes
│   │   ├── services/          ← Business logic
│   │   ├── database/          ← DB schema & migrations
│   │   └── utils/             ← Helper functions
│   └── package.json
│
├── passenger-app/             ← React Native (Expo)
│   ├── src/
│   │   ├── screens/           ← App screens
│   │   ├── navigation/        ← Navigation setup
│   │   ├── context/           ← State management
│   │   └── services/          ← API & Socket clients
│   └── app.json
│
├── admin-dashboard/           ← Next.js 14
│   ├── app/
│   │   ├── layout.js          ← Root layout
│   │   ├── page.js            ← Dashboard
│   │   ├── fleet/             ← Fleet monitoring
│   │   ├── routes/            ← Route management
│   │   └── analytics/         ← Analytics
│   └── lib/
│       ├── api.js             ← API client
│       └── socket.js          ← Socket.io client
│
└── data/                      ← CSV sample data
    ├── buses.csv
    ├── routes.csv
    ├── bus_stops.csv
    └── ...
```

---

## 🔧 Configuration Files

### Backend `.env`

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_bus_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_key_at_least_32_chars_long

CORS_ORIGIN=http://localhost:3000,exp://192.168.1.100:19000
```

### Passenger App `app.json`

```json
{
  "extra": {
    "apiUrl": "http://192.168.1.100:5000/api",
    "socketUrl": "http://192.168.1.100:5000",
    "mapboxToken": "YOUR_MAPBOX_TOKEN"
  }
}
```

### Admin Dashboard `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN
```

---

## 🎨 Key Features Implemented

### ✅ Backend
- REST API with Express.js
- PostgreSQL database with proper schema
- Real-time updates via Socket.io
- Bus simulation service (auto-updates every 5s)
- ETA calculation algorithm
- Crowd status tracking
- JWT authentication

### ✅ Passenger Mobile App
- User authentication (login/register)
- Home screen with stop search
- Live bus map with real-time updates
- Stop arrivals with ETA countdown
- Bus details with crowd reporting
- Real-time Socket.io integration
- Clean Material Design UI

### ✅ Admin Dashboard
- Dashboard overview with stats
- Fleet monitoring table
- Routes management
- Live analytics
- Real-time bus tracking
- Responsive Material-UI design

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Buses
- `GET /api/buses` - Get all buses
- `GET /api/buses/:bus_id` - Get bus details
- `GET /api/buses/:bus_id/location` - Get bus location
- `GET /api/buses/:bus_id/eta` - Get bus ETA

### Stops
- `GET /api/stops` - Get all stops
- `GET /api/stops/:stop_id` - Get stop details
- `GET /api/stops/:stop_id/arrivals` - Get upcoming arrivals

### Crowd
- `POST /api/crowd/update` - Update crowd status
- `GET /api/crowd/:bus_id` - Get crowd status

### Admin
- `GET /api/admin/buses` - Get all buses (admin)
- `GET /api/admin/routes` - Get all routes
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/fleet-status` - Get fleet status

**Full API documentation:** `backend/API.md`

---

## 🔴 Important Notes

### For Mobile App Testing

⚠️ **Don't use `localhost`** - Use your computer's IP address  
⚠️ **Firewall** - Allow port 5000 in firewall  
⚠️ **Same Network** - Phone and computer must be on same WiFi  

Find your IP:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

### Database

Default test credentials:
- **Admin:** admin@smartbus.com / admin123
- **Passenger:** passenger@test.com / password123

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check PostgreSQL is running
pg_isready

# Check port 5000 is free
netstat -an | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Verify database exists
psql -l | grep smart_bus_db
```

### Mobile app can't connect

1. Check backend is running
2. Use IP address, not localhost
3. Update app.json with correct IP
4. Check firewall settings
5. Ensure same WiFi network

### Real-time updates not working

1. Check Socket.io connection in console
2. Verify bus simulation is running
3. Check backend logs for errors

---

## 🎯 Demo Script (5 minutes)

### 1. Show Admin Dashboard (1 min)
- Open dashboard overview
- Show live fleet monitoring
- Display real-time bus updates
- View analytics

### 2. Show Mobile App (2 min)
- Login as passenger
- Search for a bus stop
- Show live arrivals with ETA
- Open live map with moving buses
- View bus details
- Report crowd status

### 3. Show Real-time Updates (2 min)
- Split screen: Admin + Mobile
- Show bus moving on both
- Update crowd level on mobile
- See it reflect on admin dashboard
- Show ETA countdown

---

## 🚀 Deployment (Production)

### Backend - Railway/Render

```bash
# Add Procfile
web: npm start

# Deploy to Railway
railway login
railway init
railway up
```

### Admin Dashboard - Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd admin-dashboard
vercel
```

### Mobile App - Expo Build

```bash
# Build APK
cd passenger-app
expo build:android

# Or using EAS
eas build --platform android
```

---

## 📝 License

MIT License - Free to use for hackathons and projects

---

## 🎓 Technologies Used

- **Backend:** Node.js, Express.js, PostgreSQL, Socket.io
- **Mobile:** React Native, Expo, React Navigation, React Native Paper
- **Dashboard:** Next.js 14, Material-UI, Socket.io Client
- **Maps:** Mapbox GL (integration ready)
- **Real-time:** Socket.io
- **Database:** PostgreSQL with proper indexing

---

## ⏱️ Build Timeline

- **Hour 0-2:** Backend API + Database ✅
- **Hour 2-4:** Real-time Socket.io + Simulation ✅
- **Hour 4-8:** Mobile App UI ✅
- **Hour 8-12:** Admin Dashboard ✅
- **Hour 12-16:** Integration & Testing ✅
- **Hour 16-20:** Polish & Bug Fixes
- **Hour 20-24:** Demo Prep & Final Testing

---

## 🏆 Ready for Hackathon!

Your real-time bus monitoring system is complete with:
✅ Professional architecture  
✅ Clean, modular code  
✅ Real-time functionality  
✅ Beautiful UI  
✅ Production-ready structure  

**Good luck! 🚀**
