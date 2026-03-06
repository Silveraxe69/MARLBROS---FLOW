# Smart Bus Passenger App

React Native (Expo) mobile app for real-time bus tracking and arrival information.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Expo CLI installed: `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android)

### Installation

```bash
cd passenger-app
npm install
```

### Configuration

Update `app.json` with your backend URLs:

```json
{
  "extra": {
    "apiUrl": "http://YOUR_IP:5000/api",
    "socketUrl": "http://YOUR_IP:5000",
    "mapboxToken": "YOUR_MAPBOX_TOKEN"
  }
}
```

**Important:** Replace `YOUR_IP` with your computer's local IP address (not localhost when testing on physical device).

### Run the App

```bash
# Start Expo development server
npx expo start

# Or specific platform
npx expo start --android
npx expo start --ios
```

Scan the QR code with:
- **iOS:** Camera app
- **Android:** Expo Go app

---

## 📱 Features

### ✅ Implemented Features

1. **User Authentication**
   - Login / Register
   - JWT-based authentication
   - Persistent session

2. **Home Screen**
   - Search bus stops
   - View nearby stops
   - Quick stats (active buses, total stops)

3. **Live Map**
   - Real-time bus locations
   - User location tracking
   - Interactive bus markers
   - Auto-updating positions

4. **Stop Arrivals**
   - Upcoming buses at a stop
   - Real-time ETA countdown
   - Bus details (AC/Non-AC, Women's bus, Accessible)
   - Crowd level indicators

5. **Bus Details**
   - Complete bus information
   - Live location and speed
   - Upcoming stops with ETA
   - Crowd reporting feature

6. **Profile**
   - User information
   - Account settings
   - Logout functionality

### 🔄 Real-time Updates

The app uses Socket.io for live updates:
- Bus locations update every 5 seconds
- ETA calculations refresh automatically
- Crowd status updates in real-time
- Stop arrival notifications

---

## 📁 Project Structure

```
passenger-app/
├── src/
│   ├── screens/          # App screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── LiveMapScreen.js
│   │   ├── StopArrivalsScreen.js
│   │   ├── BusDetailsScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── context/          # React Context (State Management)
│   │   ├── AuthContext.js
│   │   └── BusContext.js
│   ├── services/         # API & Socket.io services
│   │   ├── api.js
│   │   └── socketService.js
│   └── components/       # Reusable components (future)
├── assets/               # Images, icons, fonts
├── App.js               # Main entry point
├── app.json             # Expo configuration
├── package.json
└── babel.config.js
```

---

## 🎨 UI Components

Using **React Native Paper** for Material Design components:
- Cards
- Buttons
- Text Inputs
- Chips
- FAB (Floating Action Button)
- Lists

---

## 🔌 API Integration

All API calls are centralized in `src/services/api.js`:

```javascript
import { busAPI, stopAPI, crowdAPI } from '../services/api';

// Fetch all buses
const result = await busAPI.getAllBuses();

// Get stop arrivals
const arrivals = await stopAPI.getStopArrivals(stopId);

// Report crowd status
await crowdAPI.updateCrowdStatus({ bus_id, crowd_level: 'Medium' });
```

---

## 🌐 Socket.io Events

Real-time events handled by `socketService.js`:

```javascript
import socketService from '../services/socketService';

// Connect
socketService.connect();

// Subscribe to bus updates
socketService.joinBus('B001');

// Listen for updates
socketService.onBusLocationUpdate((data) => {
  console.log('Bus moved:', data);
});

// Cleanup
socketService.removeAllListeners();
socketService.disconnect();
```

---

## 🗺️ Maps Integration

Using **react-native-maps** with Expo:

```javascript
import MapView, { Marker } from 'react-native-maps';

<MapView
  region={mapRegion}
  showsUserLocation
  showsMyLocationButton
>
  <Marker coordinate={{ latitude, longitude }} />
</MapView>
```

---

## 🔐 Authentication Flow

1. User opens app
2. `AuthContext` checks for stored token
3. If no token → Show Login/Register
4. If token exists → Show Main App
5. Token sent in API headers automatically

---

## 🐛 Troubleshooting

### Cannot connect to backend

**Issue:** App can't reach the API

**Fix:**
1. Make sure backend is running
2. Use your computer's IP address (not `localhost`)
3. Update `apiUrl` in `app.json`
4. Check firewall settings

```bash
# Find your IP (Windows)
ipconfig

# Find your IP (Mac/Linux)
ifconfig
```

### Maps not loading

**Issue:** Map shows blank

**Fix:**
1. Check internet connection
2. Verify location permissions granted
3. Update Mapbox token in `app.json`

### Real-time updates not working

**Issue:** Bus locations not updating

**Fix:**
1. Check Socket.io connection in console
2. Verify backend simulation is running
3. Check `socketUrl` in `app.json`

---

## 📱 Building for Production

### Android APK

```bash
# Build APK
expo build:android

# OR using EAS Build
eas build --platform android
```

### iOS IPA

```bash
# Build IPA (requires Apple Developer account)
expo build:ios

# OR using EAS Build
eas build --platform ios
```

---

## 🎯 Testing Credentials

```
Email: passenger@test.com
Password: password123
```

Or register a new account.

---

## 🚧 Future Enhancements

- [ ] Turn-by-turn navigation
- [ ] Favorite routes/stops
- [ ] Push notifications for arrivals
- [ ] Offline mode
- [ ] Journey planner
- [ ] Route suggestions
- [ ] Payment integration
- [ ] AR bus tracking

---

## 📄 License

MIT License

---

## 🙋 Support

For issues or questions:
- Email: support@smartbus.com
- GitHub Issues: [Create an issue]

---

**Happy Tracking! 🚌📍**
