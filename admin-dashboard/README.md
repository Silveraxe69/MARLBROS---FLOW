# Smart Bus Admin Dashboard

Next.js 14 admin dashboard for managing and monitoring the Smart Bus System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend API running

### Installation

```bash
cd admin-dashboard
npm install
```

### Configuration

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Features

### 1. **Dashboard Overview**
- Total fleet statistics
- Real-time running buses count
- Active routes overview
- Fleet status breakdown
- Crowd statistics
- Busiest routes analysis

### 2. **Fleet Monitoring**
- Real-time bus tracking table
- Live location updates via Socket.io
- Bus status indicators
- Speed monitoring
- Crowd level tracking
- Service type filtering
- Search functionality

### 3. **Routes Management**
- Complete routes list
- Active buses per route
- Route distance and stops
- Start/End locations

### 4. **Live Map**
- Real-time fleet visualization
- Bus location markers
- Live tracking indicators
- Map integration placeholder

### 5. **Analytics & Insights**
- Average ETA delay metrics
- Busiest routes analysis
- Crowd level distribution
- Fleet status breakdown
- Performance insights

---

## 🏗️ Project Structure

```
admin-dashboard/
├── app/
│   ├── layout.js          # Root layout with sidebar
│   ├── page.js            # Dashboard overview
│   ├── fleet/
│   │   └── page.js        # Fleet monitoring
│   ├── routes/
│   │   └── page.js        # Routes management
│   ├── map/
│   │   └── page.js        # Live map view
│   └── analytics/
│       └── page.js        # Analytics & insights
├── lib/
│   ├── api.js             # API client
│   └── socket.js          # Socket.io client
├── package.json
├── next.config.js
└── tsconfig.json
```

---

## 🎨 UI Framework

Using **Material-UI (MUI)** for components:
- Responsive layout
- Data tables
- Cards and chips
- Icons and buttons
- Theming support

---

## 🔌 Real-time Updates

Dashboard uses Socket.io for live updates:

```javascript
import { connectSocket, onBusLocationUpdate } from '@/lib/socket';

// Connect
connectSocket();

// Listen for bus updates
onBusLocationUpdate((data) => {
  // Update UI
});
```

Events:
- `bus_location_update` - Bus GPS updates
- `bus_eta_update` - ETA recalculations
- `crowd_update` - Crowd status changes

---

## 📡 API Integration

All API calls through `lib/api.js`:

```javascript
import { adminAPI } from '@/lib/api';

// Fetch all buses
const response = await adminAPI.getAllBuses();

// Get analytics
const analytics = await adminAPI.getAnalytics();

// Get fleet status
const fleet = await adminAPI.getFleetStatus();
```

---

## 🗺️ Map Integration

To add a real map:

### Option 1: Mapbox

```bash
npm install react-map-gl mapbox-gl
```

```javascript
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

<Map
  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  initialViewState={{
    longitude: 72.8777,
    latitude: 19.0760,
    zoom: 12
  }}
  style={{ width: '100%', height: '100%' }}
  mapStyle="mapbox://styles/mapbox/streets-v12"
>
  {buses.map(bus => (
    <Marker
      key={bus.bus_id}
      longitude={bus.longitude}
      latitude={bus.latitude}
    />
  ))}
</Map>
```

### Option 2: Google Maps

```bash
npm install @vis.gl/react-google-maps
```

---

## 📈 Dashboard Components

### StatCard
Displays key metrics with icons

### Fleet Table
Real-time bus monitoring with:
- Status chips
- Speed indicators
- Crowd levels
- Service types
- Last update timestamps

### Analytics Cards
Visual insights for:
- Average delays
- Route performance
- Crowd distribution
- Fleet status

---

## 🎯 Performance Optimization

1. **Server Components** - Default in Next.js 14
2. **Client Components** - Only for interactive UI
3. **Data Fetching** - SWR for caching
4. **Socket.io** - Efficient real-time updates

---

## 🚧 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect GitHub repo to Vercel dashboard.

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

### Build

```bash
npm run build
npm start
```

---

## 🐛 Troubleshooting

### Cannot connect to API

**Issue:** Dashboard can't fetch data

**Fix:**
1. Ensure backend is running
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS settings in backend

### Real-time not working

**Issue:** Live updates not appearing

**Fix:**
1. Check Socket.io URL
2. Verify backend Socket.io is running
3. Check browser console for errors

### Build errors

**Issue:** Next.js build fails

**Fix:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## 📱 Mobile Responsive

Dashboard is fully responsive:
- Sidebar collapses on mobile
- Tables scroll horizontally
- Cards stack vertically
- Touch-friendly UI

---

## 🔐 Security

For production:
1. Add authentication layer
2. Restrict admin API endpoints
3. Use environment variables for secrets
4. Enable HTTPS
5. Implement rate limiting

---

## 🛠️ Development

### Adding a new page

1. Create file in `app/your-page/page.js`
2. Add to sidebar in `app/layout.js`
3. Fetch data using API client

### Custom components

Create in `components/` folder:

```javascript
// components/CustomCard.js
export default function CustomCard({ title, children }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {children}
      </CardContent>
    </Card>
  );
}
```

---

## 📄 License

MIT License

---

## 🎓 Tech Stack

- **Framework:** Next.js 14
- **UI Library:** Material-UI (MUI)
- **Real-time:** Socket.io Client
- **HTTP Client:** Axios
- **Language:** JavaScript/TypeScript
- **Deployment:** Vercel

---

## 🙋 Support

For issues or questions:
- Email: admin@smartbus.com
- Documentation: Check backend API.md

---

**Monitor your fleet in real-time! 🚌📊**
