# Backend Development Guide

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and update:
- Database credentials
- JWT secret
- CORS origins
- Mapbox token

### 3. Setup Database
```bash
# Create PostgreSQL database
createdb smart_bus_db

# Run schema setup
npm run db:setup

# Seed with CSV data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── authController.js
│   │   ├── busController.js
│   │   ├── stopController.js
│   │   ├── crowdController.js
│   │   └── adminController.js
│   ├── routes/           # API route definitions
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── busRoutes.js
│   │   ├── stopRoutes.js
│   │   ├── crowdRoutes.js
│   │   └── adminRoutes.js
│   ├── services/         # Business logic
│   │   ├── socketService.js
│   │   └── busSimulationService.js
│   ├── database/         # Database utilities
│   │   ├── db.js
│   │   ├── schema.sql
│   │   ├── setup.js
│   │   └── seed.js
│   ├── utils/            # Helper functions
│   │   ├── etaCalculator.js
│   │   └── geoUtils.js
│   ├── middleware/       # Express middleware
│   │   └── auth.js
│   └── server.js         # Main entry point
├── package.json
└── .env.example
```

---

## Key Features

### 1. Real-time Bus Simulation
- Automatically simulates bus movement every 5 seconds
- Updates GPS coordinates based on route
- Calculates dynamic ETAs
- Broadcasts updates via Socket.io

### 2. WebSocket Communication
- Socket.io for real-time updates
- Room-based subscriptions (bus, stop, route)
- Automatic broadcast to connected clients

### 3. ETA Calculation
Simple formula:
```
ETA (minutes) = distance (km) / speed (km/h) * 60
```

If speed = 0, bus is marked as delayed.

### 4. PostgreSQL Database
- Indexed queries for fast lookups
- Relational data model
- Transaction support
- Connection pooling

---

## API Testing

Use tools like:
- **Postman** - Import API.md endpoints
- **curl** - Command line testing
- **Thunder Client** - VS Code extension

### Example: Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartbus.com",
    "password": "admin123"
  }'
```

### Example: Get All Buses
```bash
curl http://localhost:5000/api/buses
```

---

## Socket.io Testing

Use **socket.io-client** or browser console:

```javascript
const socket = io('http://localhost:5000');

// Listen for bus updates
socket.on('bus_location_update', (data) => {
  console.log('Bus moved:', data);
});

// Subscribe to specific bus
socket.emit('join_bus', 'B001');
```

---

## Database Commands

### Reset Database
```bash
npm run db:setup
npm run db:seed
```

### Query Database
```bash
psql smart_bus_db
```

```sql
-- Get all running buses
SELECT * FROM buses WHERE status = 'running';

-- Get latest locations
SELECT * FROM bus_location ORDER BY timestamp DESC LIMIT 10;

-- Get crowded buses
SELECT b.bus_id, c.crowd_level
FROM buses b
JOIN LATERAL (
  SELECT crowd_level
  FROM crowd_status
  WHERE bus_id = b.bus_id
  ORDER BY timestamp DESC
  LIMIT 1
) c ON true
WHERE c.crowd_level = 'Full';
```

---

## Production Deployment

### Environment Variables
Set these for production:
- `NODE_ENV=production`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (strong random string)
- `CORS_ORIGIN` (your frontend URLs)

### Deployment Platforms

**Render:**
```bash
# Build command
npm install

# Start command
npm start
```

**Railway:**
- Auto-detects Node.js
- Add PostgreSQL plugin
- Set environment variables

**Heroku:**
```bash
heroku create smart-bus-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

---

## Troubleshooting

### Database Connection Issues
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Check database exists: `psql -l`

### Socket.io Not Connecting
1. Check CORS settings
2. Verify port is open
3. Check firewall rules

### Simulation Not Running
1. Check database has bus data
2. Verify bus locations exist
3. Check console for errors

---

## Performance Tips

1. **Database Indexing** - Already optimized in schema
2. **Connection Pooling** - Configured in db.js
3. **Limit Query Results** - Use LIMIT in queries
4. **Cache Frequently Accessed Data** - Implement Redis if needed

---

## Next Steps

1. ✅ Backend API complete
2. ⏭️ Build Passenger Mobile App
3. ⏭️ Build Admin Dashboard
4. ⏭️ Integrate Mapbox maps
5. ⏭️ Deploy to production
