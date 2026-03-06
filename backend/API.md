# Smart Bus System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+919876543210"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "passenger"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "passenger"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Bus Tracking Endpoints

### Get All Buses
**GET** `/buses`

**Query Parameters:**
- `route_id` (optional) - Filter by route
- `status` (optional) - Filter by status (Running, Stopped, Delayed, Maintenance)
- `service_type` (optional) - Filter by service type (Intercity, Superfast, Women_Free, Deluxe, Sleeper)
- `bus_color` (optional) - Filter by bus color (YELLOW_BLACK, BLUE_GREY, PINK, RED, WHITE)
- `women_bus` (optional) - Filter women-only buses (true/false)
- `accessible` (optional) - Filter accessible buses (true/false)

**Response (200):**
```json
{
  "count": 15,
  "buses": [
    {
      "bus_id": "B001",
      "route_id": "R101",
      "bus_color": "YELLOW_BLACK",
      "service_type": "Intercity",
      "women_bus": false,
      "accessible": false,
      "status": "Running",
      "current_location": {
        "latitude": 11.0121,
        "longitude": 76.9684,
        "speed": 42,
        "timestamp": "2026-03-06T10:21:00.000Z"
      }
    },
    {
      "bus_id": "B003",
      "route_id": "R102",
      "bus_color": "PINK",
      "service_type": "Women_Free",
      "women_bus": true,
      "accessible": false,
      "status": "Running",
      "current_location": {
        "latitude": 11.0105,
        "longitude": 76.9652,
        "speed": 31,
        "timestamp": "2026-03-06T10:21:00.000Z"
      }
    }
  ]
}
```

### Get Bus by ID
**GET** `/buses/:bus_id`

**Response (200):**
```json
{
  "bus_id": "B003",
  "route_id": "R102",
  "bus_color": "PINK",
  "service_type": "Women_Free",
  "women_bus": true,
  "accessible": false,
  "status": "Running",
  "current_location": {
    "latitude": 13.0827,
    "longitude": 80.2707,
    "speed": 32,
    "timestamp": "2026-03-06T10:21:00.000Z"
  },
  "route": {
    "route_id": "R102",
    "start_stop": "Chennai Central",
    "end_stop": "Tambaram",
    "distance_km": 28
  }
}
```

### Get Bus Location
**GET** `/buses/:bus_id/location`

**Response (200):**
```json
{
  "bus_id": "B001",
  "latitude": 11.0121,
  "longitude": 76.9684,
  "speed": 42,
  "timestamp": "2026-03-06T10:21:00.000Z"
}
```

### Get Bus ETA
**GET** `/buses/:bus_id/eta`

**Response (200):**
```json
{
  "bus_id": "B003",
  "upcoming_stops": [
    {
      "bus_id": "B003",
      "stop_id": "S002",
      "eta_minutes": 3,
      "updated_at": "2026-03-06T10:30:00.000Z",
      "stop": {
        "stop_id": "S002",
        "stop_name": "Ukkadam",
        "city": "Coimbatore",
        "latitude": 11.0056,
        "longitude": 76.9602
      }
    },
    {
      "bus_id": "B003",
      "stop_id": "S001",
      "eta_minutes": 2,
      "updated_at": "2026-03-06T10:30:00.000Z",
      "stop": {
        "stop_id": "S001",
        "stop_name": "Gandhipuram",
        "city": "Coimbatore",
        "latitude": 11.0183,
        "longitude": 76.9725
      }
    }
  ]
}
```

---

## Bus Stops Endpoints

### Get All Stops
**GET** `/stops`

**Query Parameters:**
- `city` (optional) - Filter by city (Coimbatore, Chennai, Madurai, Salem, Erode, etc.)
- `route_id` (optional) - Get stops for a specific route

**Response (200):**
```json
{
  "count": 20,
  "stops": [
    {
      "stop_id": "S001",
      "stop_name": "Gandhipuram",
      "city": "Coimbatore",
      "latitude": 11.0183,
      "longitude": 76.9725
    },
    {
      "stop_id": "S002",
      "stop_name": "Ukkadam",
      "city": "Coimbatore",
      "latitude": 11.0056,
      "longitude": 76.9602
    }
  ]
}
```

### Get Stop by ID
**GET** `/stops/:stop_id`

**Response (200):**
```json
{
  "stop_id": "S001",
  "stop_name": "Gandhipuram",
  "city": "Coimbatore",
  "latitude": 11.0183,
  "longitude": 76.9725
}
```

### Get Stop Arrivals
**GET** `/stops/:stop_id/arrivals`

**Response (200):**
```json
{
  "stop_id": "S002",
  "upcoming_buses": [
    {
      "bus_id": "B003",
      "stop_id": "S002",
      "eta_minutes": 3,
      "bus": {
        "bus_id": "B003",
        "route_id": "R102",
        "bus_color": "PINK",
        "service_type": "Women_Free",
        "women_bus": true,
        "accessible": false,
        "status": "Running"
      },
      "crowd_level": "Medium"
    },
    {
      "bus_id": "B001",
      "stop_id": "S002",
      "eta_minutes": 4,
      "bus": {
        "bus_id": "B001",
        "route_id": "R101",
        "bus_color": "YELLOW_BLACK",
        "service_type": "Intercity",
        "women_bus": false,
        "accessible": false,
        "status": "Running"
      },
      "crowd_level": "Low"
    }
  ]
}
```

---

## Crowd Update Endpoints

### Update Crowd Status
**POST** `/crowd/update`

**Request Body:**
```json
{
  "bus_id": "B001",
  "stop_id": "S001",
  "crowd_level": "Medium",
  "user_id": 1
}
```

**Crowd Levels:** `Low`, `Medium`, `Full`

**Response (201):**
```json
{
  "message": "Crowd status updated successfully",
  "crowdStatus": {
    "crowd_id": 1,
    "bus_id": "B001",
    "stop_id": "S001",
    "crowd_level": "Medium",
    "user_id": 1,
    "timestamp": "2026-03-06T10:30:00.000Z"
  }
}
```

### Get Crowd Status
**GET** `/crowd/:bus_id`

**Response (200):**
```json
{
  "crowdStatus": {
    "crowd_id": 1,
    "bus_id": "B001",
    "crowd_level": "Medium",
    "timestamp": "2026-03-06T10:30:00.000Z"
  }
}
```

---

## Admin Endpoints

### Get All Buses (Admin)
**GET** `/admin/buses`

**Response (200):**
```json
{
  "buses": [
    {
      "bus_id": "B001",
      "route_id": "R001",
      "status": "running",
      "route_name": "City Center - Airport",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "speed": 35.5,
      "last_updated": "2026-03-06T10:30:00.000Z",
      "crowd_level": "Medium"
    }
  ]
}
```

### Get All Routes (Admin)
**GET** `/admin/routes`

**Response (200):**
```json
{
  "routes": [
    {
      "route_id": "R001",
      "route_name": "City Center - Airport",
      "start_stop": "Central Station",
      "end_stop": "Airport Terminal",
      "distance_km": 25.5,
      "active_buses": 3,
      "total_stops": 4
    }
  ]
}
```

### Get Analytics (Admin)
**GET** `/admin/analytics`

**Response (200):**
```json
{
  "busiestRoutes": [
    {
      "route_id": "R001",
      "route_name": "City Center - Airport",
      "bus_count": 3,
      "avg_eta": 12.5
    }
  ],
  "avgDelay": 8.3,
  "crowdStats": [
    {
      "crowd_level": "Low",
      "count": 5
    },
    {
      "crowd_level": "Medium",
      "count": 7
    },
    {
      "crowd_level": "Full",
      "count": 3
    }
  ],
  "fleetStatus": [
    {
      "status": "running",
      "count": 15
    }
  ]
}
```

### Get Fleet Status (Admin)
**GET** `/admin/fleet-status`

**Response (200):**
```json
{
  "fleet": [
    {
      "bus_id": "B001",
      "route_id": "R001",
      "status": "running",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "speed": 35.5,
      "timestamp": "2026-03-06T10:30:00.000Z",
      "real_time_status": "running"
    }
  ]
}
```

---

## WebSocket Events (Socket.io)

### Client → Server Events

**Join Bus Channel:**
```javascript
socket.emit('join_bus', 'B001');
```

**Join Stop Channel:**
```javascript
socket.emit('join_stop', 'S001');
```

**Join Route Channel:**
```javascript
socket.emit('join_route', 'R001');
```

**Join Admin Channel:**
```javascript
socket.emit('join_admin');
```

**Send Passenger Location:**
```javascript
socket.emit('passenger_location', {
  latitude: 19.0760,
  longitude: 72.8777
});
```

### Server → Client Events

**Bus Location Update:**
```javascript
socket.on('bus_location_update', (data) => {
  console.log(data);
  // {
  //   bus_id: 'B001',
  //   latitude: 19.0760,
  //   longitude: 72.8777,
  //   speed: 35.5,
  //   timestamp: '2026-03-06T10:30:00.000Z'
  // }
});
```

**Bus ETA Update:**
```javascript
socket.on('bus_eta_update', (data) => {
  console.log(data);
  // {
  //   bus_id: 'B001',
  //   eta: [...]
  // }
});
```

**Crowd Update:**
```javascript
socket.on('crowd_update', (data) => {
  console.log(data);
  // {
  //   bus_id: 'B001',
  //   crowd_level: 'Medium',
  //   timestamp: '2026-03-06T10:30:00.000Z'
  // }
});
```

**Bus Arrival at Stop:**
```javascript
socket.on('bus_arrival', (data) => {
  console.log(data);
  // {
  //   stop_id: 'S001',
  //   bus_id: 'B001',
  //   ...
  // }
});
```

---

## Error Responses

All endpoints return errors in this format:

**400 Bad Request:**
```json
{
  "error": "Invalid input parameters"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```
