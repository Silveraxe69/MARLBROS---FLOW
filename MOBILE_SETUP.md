# 📱 Mobile App Setup Guide

## ✅ Current Status
- **Backend Server**: Running on http://localhost:5000
- **Admin Dashboard**: Running on http://localhost:3000  
- **Expo Dev Server**: Running on port 8081
- **Your Computer IP**: 192.168.156.122

## 📲 How to Open the App on Your Mobile Phone

### Step 1: Install Expo Go App
Download and install **Expo Go** on your mobile device:
- **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [Apple App Store](https://apps.apple.com/app/expo-go/id982107779)

### Step 2: Connect to Development Server

**Option A: Manual URL Entry (Recommended)**
1. Open **Expo Go** app on your phone
2. Make sure your phone is connected to the **same Wi-Fi network** as your computer
3. In Expo Go, look for "Enter URL manually" or tap the "+" button
4. Enter this URL:
   ```
   exp://192.168.156.122:8081
   ```
5. Tap "Connect" or "Go"

**Option B: QR Code (if available)**
1. Check your terminal running `npx expo start`
2. If a QR code is displayed, scan it with:
   - **Android**: Use the Expo Go app's built-in QR scanner
   - **iOS**: Use your Camera app, then tap the Expo Go notification

### Step 3: Wait for App to Load
- The app will download JavaScript bundle from your computer
- First load may take 30-60 seconds
- You'll see a loading screen with "Loading your app..."

### Step 4: Start Testing!
Once loaded, you can:
- ✅ Register/Login as a passenger
- ✅ View live bus locations on map
- ✅ Search for bus routes
- ✅ Check bus arrival times at stops
- ✅ See real-time crowd status

## 🔧 Troubleshooting

### "Unable to connect to development server"
1. Verify both devices are on **same Wi-Fi network**
2. Check Windows Firewall isn't blocking port 8081:
   ```powershell
   New-NetFirewallRule -DisplayName "Expo Dev Server" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
   ```
3. Verify your IP hasn't changed (run `ipconfig` in terminal)
4. Update app.json with new IP if changed

### "Network request failed" errors in the app
- The backend server must be running on port 5000
- Check backend server is accessible: http://192.168.156.122:5000/health
- Verify CORS settings allow mobile connections

### App crashes or shows errors
1. In your terminal running Expo, press `r` to reload the app
2. Clear cache by pressing `Shift + R` in terminal
3. Check terminal for error messages

## 🎨 Test Accounts

**Passenger Account:**
- Email: `passenger@test.com`
- Password: `password123`

**Admin Account (for web dashboard):**
- Email: `admin@smartbus.com`
- Password: `admin123`

## 📡 Backend API Endpoints (configured in app)
- **API Base**: http://192.168.156.122:5000/api
- **Socket.IO**: http://192.168.156.122:5000

## 🚌 Tamil Nadu Bus Features
The app shows buses with color codes:
- **YELLOW_BLACK** - Intercity buses
- **BLUE_GREY** - Superfast buses
- **PINK** - Women-only buses
- **RED** - Deluxe buses
- **WHITE** - Sleeper buses

Routes include:
- R101: Gandhipuram → Pollachi (42 km)
- R102: Chennai Central → Tambaram (28 km)
- R103: Madurai → Dindigul (62 km)
- R104: Salem → Erode (65 km)
- R105: Tiruchirappalli → Thanjavur (55 km)

## 🔄 Making Changes
When you edit code in the passenger-app folder:
- Expo will automatically reload the app on your phone
- If it doesn't auto-reload, shake your phone and tap "Reload"

## 💡 Tips
- Keep your computer plugged in (mobile dev server is resource-intensive)
- Keep both devices on same Wi-Fi for best performance
- Use `console.log()` in code - logs appear in terminal
- Press `m` in terminal to open React DevTools menu on phone

---
**Need Help?** Check the Expo terminal for real-time logs and errors!
