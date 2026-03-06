# 🚌 Smart Bus System - Real-Time Public Bus Monitoring

> **A production-ready, real-time bus tracking system built with modern architecture for 24-hour hackathons**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue.svg)](https://expo.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-orange.svg)](https://socket.io/)

---

## 🎯 Project Overview

A complete **real-time public bus monitoring ecosystem** consisting of:

1. **🚌 Passenger Mobile App** (React Native + Expo)
2. **💻 Admin Web Dashboard** (Next.js 14 + Material-UI)
3. **⚡ Real-time Backend API** (Node.js + Express + Socket.io)
4. **🗄️ PostgreSQL Database** (Optimized schema with indexing)

---

## ✨ Key Features

### 🎯 Real-Time Capabilities
- ✅ Live bus location tracking (updates every 5 seconds)
- ✅ Dynamic ETA calculations
- ✅ Instant crowd status updates
- ✅ WebSocket-based real-time communication

### 📱 Passenger Experience
- ✅ Search bus stops & routes
- ✅ Live bus arrivals with countdown
- ✅ Interactive map with moving buses
- ✅ Report bus crowd levels
- ✅ Bus details (AC/Non-AC, Women's bus, Accessible)

### 📊 Admin Dashboard
- ✅ Fleet monitoring with live status
- ✅ Route management
- ✅ Analytics & performance insights
- ✅ Crowd heatmaps
- ✅ Real-time bus tracking table

---

## 🏗️ Architecture

```
smart-bus-system/
│
├── 📁 backend/                    ← Node.js + Express + Socket.io
│   ├── src/
│   │   ├── controllers/          ← API request handlers
│   │   ├── routes/               ← REST API routes
│   │   ├── services/             ← Business logic & simulation
│   │   ├── database/             ← PostgreSQL schema & seeds
│   │   ├── utils/                ← ETA calculator, geo utils
│   │   └── server.js             ← Main entry point
│   └── package.json
│
├── 📱 passenger-app/              ← React Native (Expo)
│   ├── src/
│   │   ├── screens/              ← App screens
│   │   ├── navigation/           ← React Navigation setup
│   │   ├── context/              ← Auth & Bus context
│   │   └── services/             ← API & Socket.io clients
│   ├── App.js
│   └── app.json
│
├── 💻 admin-dashboard/            ← Next.js 14
│   ├── app/
│   │   ├── page.js               ← Dashboard overview
│   │   ├── fleet/                ← Fleet monitoring
│   │   ├── routes/               ← Routes management
│   │   ├── analytics/            ← Analytics page
│   │   └── layout.js             ← Root layout
│   └── lib/
│       ├── api.js                ← API client
│       └── socket.js             ← Socket.io client
│
└── 📊 data/                       ← Sample CSV datasets
    ├── buses.csv
    ├── routes.csv
    ├── bus_stops.csv
    └── ...
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Expo CLI (`npm install -g expo-cli`)

### 1️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials

createdb smart_bus_db
npm run db:setup
npm run db:seed
npm run dev
```

✅ Backend running on **http://localhost:5000**

### 2️⃣ Passenger App Setup

```bash
cd passenger-app
npm install
# Update app.json with your IP address
npx expo start
```

✅ Scan QR with Expo Go app

### 3️⃣ Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
cp .env.local.example .env.local
npm run dev
```

✅ Dashboard at **http://localhost:3000**

**📖 Detailed setup guide:** [QUICKSTART.md](QUICKSTART.md)

---

## 📊 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Node.js + Express | REST API server |
| **Database** | PostgreSQL | Relational data storage |
| **Real-time** | Socket.io | WebSocket communication |
| **Mobile App** | React Native (Expo) | Cross-platform mobile |
| **Admin Dashboard** | Next.js 14 | Modern React framework |
| **UI (Mobile)** | React Native Paper | Material Design |
| **UI (Dashboard)** | Material-UI (MUI) | Component library |
| **Maps** | Mapbox GL | Interactive maps |
| **State Management** | React Context API | Global state |
| **API Client** | Axios | HTTP requests |

---

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
```

### Bus Tracking
```http
GET  /api/buses
GET  /api/buses/:bus_id
GET  /api/buses/:bus_id/location
GET  /api/buses/:bus_id/eta
```

### Bus Stops
```http
GET  /api/stops
GET  /api/stops/:stop_id
GET  /api/stops/:stop_id/arrivals
```

### Crowd Updates
```http
POST /api/crowd/update
GET  /api/crowd/:bus_id
```

### Admin
```http
GET  /api/admin/buses
GET  /api/admin/routes
GET  /api/admin/analytics
GET  /api/admin/fleet-status
```

**📖 Full API Documentation:** [backend/API.md](backend/API.md)

---

## 🎨 Screenshots & Demo

### Passenger Mobile App
- 🏠 Home Screen - Search stops
- 🗺️ Live Map - Real-time bus tracking
- 🚏 Stop Arrivals - ETA countdown
- 📝 Bus Details - Crowd reporting

### Admin Dashboard
- 📊 Overview - Key metrics
- 🚌 Fleet Monitor - Live tracking table
- 📍 Routes - Route management
- 📈 Analytics - Insights & charts

---

## 🧪 Testing

### Test Credentials

**Admin:**
```
Email: admin@smartbus.com
Password: admin123
```

**Passenger:**
```
Email: passenger@test.com
Password: password123
```

### API Health Check

```bash
curl http://localhost:5000/health
```

---

## 🔄 Real-Time System

### Socket.io Events

**Client → Server:**
- `join_bus` - Subscribe to bus updates
- `join_stop` - Subscribe to stop updates
- `join_admin` - Admin channel subscription

**Server → Client:**
- `bus_location_update` - GPS position updates
- `bus_eta_update` - ETA recalculations
- `crowd_update` - Crowd status changes
- `bus_arrival` - Stop arrival notifications

---

## 🗄️ Database Schema

```sql
users           ← User accounts (passenger, admin, driver)
routes          ← Bus routes
bus_stops       ← Stop locations
buses           ← Fleet information
bus_stop_sequence ← Route stop order
bus_location    ← Real-time GPS data
bus_eta         ← Calculated ETAs
crowd_status    ← Passenger-reported crowd levels
```

**📖 Full Schema:** [backend/src/database/schema.sql](backend/src/database/schema.sql)

---

## 🎯 Hackathon-Ready Features

✅ **Fast to Build** - Modular architecture  
✅ **Visually Impressive** - Modern UI/UX  
✅ **Stable Demo** - Production-quality code  
✅ **Clean Code** - Well-documented & organized  
✅ **Real-time** - Live updates every 5 seconds  
✅ **Scalable** - Proper database indexing  

---

## 🚀 Deployment

### Backend → Railway/Render
```bash
railway login
railway init
railway up
```

### Admin Dashboard → Vercel
```bash
vercel
```

### Mobile App → Expo Build
```bash
expo build:android
```

**📖 Deployment Guide:** [QUICKSTART.md#deployment](QUICKSTART.md#deployment)

---

## 📁 Project Structure

Each module has its own README:
- [Backend Documentation](backend/README.md)
- [Passenger App Documentation](passenger-app/README.md)
- [Admin Dashboard Documentation](admin-dashboard/README.md)

---

## 🤝 Contributing

This is a hackathon starter template. Feel free to:
- Fork and customize
- Add new features
- Improve documentation
- Submit issues

---

## 📝 License

MIT License - Free for hackathons and personal projects

---

## 🎓 Learning Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Native Documentation](https://reactnative.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Guide](https://socket.io/docs/)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

---

## 🌟 Star this repo if you found it helpful!

Built with ❤️ for hackathons worldwide

---

**🎯 Ready to win your hackathon? [Get Started →](QUICKSTART.md)**
