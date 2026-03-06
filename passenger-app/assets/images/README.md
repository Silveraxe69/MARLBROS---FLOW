# Logo Files for Passenger Mobile App

## 📍 SAVE YOUR LOGO HERE

Place your Tamil Nadu State Transport Corporation logo in this folder:
```
passenger-app/assets/images/tnstc-logo.png
```

## Required File:
- **tnstc-logo.png** - Main TNSTC logo
  - Recommended size: 512x512px to 1024x1024px
  - Format: PNG (with transparent background preferred)
  - This will appear on login, register, and home screens

## Optional Files:
- **tnstc-logo-small.png** - Smaller version (128x128px) for compact displays
- **splash-icon.png** - Splash screen icon (1024x1024px minimum)

## Current Status:
⚠️ **No logo uploaded yet**
- The app currently uses a Logo component with bus emoji fallback
- Once you save `tnstc-logo.png` in this folder, it will automatically appear
- **Use the official TNSTC logo** with the Tamil Nadu government emblem (temple gopuram symbol)

## Design Guidelines:
- The official TNSTC logo has the TN government emblem with traditional colors
- Logo should work well on blue background (#1565C0)
- Recommended: Extract logo from the official TNSTC website
- The logo includes Tamil and English text: "Tamil Nadu State Transport Corporation Ltd."

## How It Works:
1. Save your logo as `tnstc-logo.png` in this folder
2. Reload the Expo app (shake device → Reload, or press 'r' in terminal)
3. The logo will automatically appear in place of the emoji

## Fallback Behavior:
- If logo file is not found → Shows bus emoji 🚌
- If logo fails to load → Automatically falls back to emoji
- This prevents app crashes when logo is missing

## For App Icon (Optional):
To use your logo as the app icon:
1. Save a 1024x1024px version
2. Update `app.json` icon path
3. Run `npx expo prebuild` to generate native icons

---
💡 **Tip**: Use the official TNSTC logo from the government website for authentic branding!
🎨 **Theme**: The app now uses official TNSTC blue colors (#1565C0) matching the website!
📱 **Note**: After saving the logo, reload the app to see changes instantly.
