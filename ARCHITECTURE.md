# 🚌 Smart Bus System - Project Architecture

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SMART BUS SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  Passenger   │         │    Admin     │                  │
│  │  Mobile App  │         │  Dashboard   │                  │
│  │ (React Native)│        │  (Next.js)   │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                           │
│         │    REST API + Socket.io│                           │
│         └────────┬───────────────┘                           │
│                  │                                            │
│         ┌────────▼─────────┐                                 │
│         │   Backend API    │                                 │
│         │   (Node.js +     │                                 │
│         │    Express)      │                                 │
│         └────────┬─────────┘                                 │
│                  │                                            │
│         ┌────────▼─────────┐                                 │
│         │   PostgreSQL     │                                 │
│         │    Database      │                                 │
│         └──────────────────┘                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Core Components

### 1️⃣ Backend (Node.js + Express)
**Location:** `backend/`

**Features:**
- RESTful API endpoints
- Real-time Socket.io server
- Live bus simulation
- ETA calculation engine
- CSV data loader
- PostgreSQL integration

**Key Files:**
- `src/server.js` - Main entry point
- `src/routes/` - API route definitions
- `src/controllers/` - Request handlers
- `src/services/` - Business logic
- `src/database/` - Database utilities

### 2️⃣ Database (PostgreSQL)
**Schema:**
```
users ─────────┐
buses ─────────┼──> bus_location (real-time GPS)
routes ────────┼──> bus_eta (predictions)
bus_stops ─────┼──> crowd_status
               │
bus_stop_sequence (route mapping)
```

**Features:**
- Indexed queries for performance
- Relational data model
- Real-time location tracking
- Historical data support

### 3️⃣ Passenger App (React Native/Expo)
**Location:** `passenger-app/`

**Screens:**
- Login/Register
- Home (Stop Search)
- Live Map
- Stop Arrivals
- Bus Details
- Profile

**Features:**
- Real-time bus tracking
- Live ETA countdown
- Crowd reporting
- User location
- Socket.io integration

### 4️⃣ Admin Dashboard (Next.js 14)
**Location:** `admin-dashboard/`

**Pages:**
- Dashboard Overview
- Fleet Monitoring
- **Routes Management**
- Live Map View
- Analytics & Insights

**Features:**
- Real-time fleet tracking
- Performance analytics
- Crowd monitoring
- Route management
- Socket.io updates

---

## 🔄 Data Flow

### Real-time Bus Updates
```
1. Bus GPS Simulator (Backend)
   ↓
2. Update Database (bus_location table)
   ↓
3. Emit Socket.io Event
   ↓
4. ┌──> Passenger App (Updates Map)
   └──> Admin Dashboard (Updates Table)
```

### ETA Calculation
```
1. Get Bus Current Location
   ↓
2. Get Target Stop Location
   ↓
3. Calculate Distance (Haversine Formula)
   ↓
4. ETA = Distance / Speed × 60 (minutes)
   ↓
5. Store in bus_eta table
   ↓
6. Broadcast via Socket.io
```

### Crowd Reporting
```
1. Passenger Reports Crowd (Mobile App)
   ↓
2. POST /api/crowd/update
   ↓
3. Insert into crowd_status table
   ↓
4. Emit Socket.io Event
   ↓
5. ┌──> Other Passengers See Update
   └──> Admin Sees in Dashboard
```

---

## 🏗️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Real-time:** Socket.io
- **Auth:** JWT + bcryptjs

### Passenger App
- **Framework:** React Native (Expo)
- **UI Library:** React Native Paper
- **Navigation:** React Navigation
- **State:** React Context API
- **Maps:** react-native-maps
- **Real-time:** socket.io-client

### Admin Dashboard
- **Framework:** Next.js 14
- **UI Library:** Material-UI (MUI)
- **Styling:** Emotion
- **HTTP Client:** Axios
- **Real-time:** socket.io-client

---

## 📊 Database Schema

### Core Tables

**users**
```sql
- user_id (PK)
- email (UNIQUE)
- password_hash
- name
- phone
- role (passenger/admin/driver)
```

**routes**
```sql
- route_id (PK)
- route_name
- start_stop
- end_stop
- distance_km
```

**buses**
```sql
- bus_id (PK)
- route_id (FK)
- bus_color
- service_type (AC/Non-AC)
- women_bus (boolean)
- accessible (boolean)
- status (running/stopped/delayed)
```

**bus_stops**
```sql
- stop_id (PK)
- stop_name
- city
- latitude
- longitude
```

**bus_location** (Real-time)
```sql
- location_id (PK)
- bus_id (FK)
- latitude
- longitude
- speed
- timestamp
```

**bus_eta**
```sql
- eta_id (PK)
- bus_id (FK)
- stop_id (FK)
- eta_minutes
- distance_km
- updated_at
```

**crowd_status**
```sql
- crowd_id (PK)
- bus_id (FK)
- stop_id (FK)
- crowd_level (Low/Medium/Full)
- user_id (FK)
- timestamp
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Bus Tracking
- `GET /api/buses` - Get all buses
- `GET /api/buses/:id` - Get bus details
- `GET /api/buses/:id/location` - Get live location
- `GET /api/buses/:id/eta` - Get ETA for stops

### Bus Stops
- `GET /api/stops` - Get all stops
- `GET /api/stops/:id` - Get stop details
- `GET /api/stops/:id/arrivals` - Get arriving buses

### Crowd
- `POST /api/crowd/update` - Report crowd status
- `GET /api/crowd/:bus_id` - Get crowd level

### Admin
- `GET /api/admin/buses` - All buses (detailed)
- `GET /api/admin/routes` - All routes with stats
- `GET /api/admin/analytics` - System analytics
- `GET /api/admin/fleet-status` - Real-time fleet status

---

## ⚡ Real-time Events (Socket.io)

### Server → Client Events
- `bus_location_update` - Bus moved
- `bus_eta_update` - ETA recalculated
- `crowd_update` - Crowd level changed
- `bus_arrival` - Bus arrived at stop

### Client → Server Events
- `join_bus` - Subscribe to bus updates
- `join_stop` - Subscribe to stop updates
- `join_route` - Subscribe to route updates
- `join_admin` - Join admin channel

---

## 🎨 UI/UX Design Principles

### Passenger App
1. **Simple & Intuitive** - Easy navigation
2. **Real-time Feedback** - Live updates
3. **Clear Information** - ETA, crowd, status
4. **Accessibility** - Large buttons, clear text

### Admin Dashboard
1. **Data Density** - Comprehensive views
2. **Real-time Monitoring** - Auto-refresh
3. **Visual Analytics** - Charts & graphs
4. **Responsive** - Works on all screens

---

## 🔒 Security Considerations

### Implemented
- Password hashing (bcryptjs)
- JWT authentication
- Input validation
- SQL injection prevention (parameterized queries)
- CORS configuration

### Production Recommendations
- HTTPS enforcement
- Rate limiting
- API key authentication
- Role-based access control
- Data encryption

---

## 📈 Scalability

### Current Capacity
- **15 buses** (can easily scale to 1000+)
- **20 stops** (unlimited)
- **Real-time updates** every 5 seconds

### Optimization for Scale
1. **Database Indexing** - Already implemented
2. **Connection Pooling** - Configured
3. **Socket.io Rooms** - Efficient broadcasting
4. **Caching Layer** - Redis (future)
5. **Load Balancing** - Multiple servers (future)

---

## 🧪 Testing Strategy

### Unit Tests
- API endpoint tests
- ETA calculation tests
- Geolocation utils tests

### Integration Tests
- Database operations
- Socket.io events
- API workflows

### E2E Tests
- User registration flow
- Bus tracking flow
- Admin operations

---

## 🚀 Deployment Architecture

### Development
```
Local PostgreSQL → Backend (localhost:5000)
                 ↓
        Passenger App (Expo Dev Server)
        Admin Dashboard (localhost:3000)
```

### Production
```
PostgreSQL (Railway/Render)
    ↓
Backend API (Railway/Render)
    ↓
    ├─> Passenger App (Expo Cloud)
    └─> Admin Dashboard (Vercel)
```

---

## 📦 File Structure

```
flow-bus-system/
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
├── passenger-app/           # React Native
│   ├── src/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── context/
│   │   └── services/
│   ├── App.js
│   └── package.json
├── admin-dashboard/         # Next.js
│   ├── app/
│   │   ├── fleet/
│   │   ├── routes/
│   │   ├── map/
│   │   ├── analytics/
│   │   └── layout.js
│   ├── lib/
│   └── package.json
├── data/                    # CSV datasets
│   ├── buses.csv
│   ├── routes.csv
│   ├── bus_stops.csv
│   └── ...
├── README.md
├── HACKATHON_GUIDE.md
└── ARCHITECTURE.md
```

---

## 🎯 Key Innovations

1. **Live Bus Simulation** - Realistic GPS movement
2. **Dynamic ETA** - Real-time calculations
3. **Crowd-sourced Data** - Passenger contributions
4. **Dual Interface** - Passenger + Admin
5. **Socket.io Integration** - True real-time

---

## 🔮 Future Enhancements

**Phase 2:**
- Push notifications
- Route planning
- Payment integration
- Offline mode

**Phase 3:**
- Machine learning for ETA
- Predictive analytics
- IoT integration
- Multi-language support

**Phase 4:**
- Multi-city support
- White-label solution
- API marketplace
- Mobile payments

---

## 📚 References

- [Express.js Docs](https://expressjs.com/)
- [Socket.io Guide](https://socket.io/docs/)
- [React Native Docs](https://reactnative.dev/)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)

---

**Built with ❤️ for Hackathons**
