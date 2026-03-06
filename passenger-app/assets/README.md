# Assets Folder

This folder contains app icons and splash screens for the Smart Bus Passenger app.

## Quick Setup for Hackathon

For a quick demo, you can use Expo's default icons temporarily by running:

```bash
# Expo will use default icons if these files are missing
npx expo start
```

## Creating Proper Icons

### Option 1: Use Online Tools (Fastest)
1. Go to https://www.appicon.co/ or https://icon.kitchen/
2. Upload any bus icon image (1024x1024)
3. Download the generated icons
4. Place them in this folder

### Option 2: Use Expo's Icon Tool
```bash
# Install expo-cli
npm install -g expo-cli

# Generate icons from a single image
expo generate-icons ./path/to/your-icon.png
```

### Option 3: Create Simple Placeholders
Use any image editor to create:
- `icon.png` - 1024x1024px (app icon)
- `splash.png` - 1284x2778px (splash screen)
- `adaptive-icon.png` - 1024x1024px (Android adaptive icon)
- `favicon.png` - 48x48px (web favicon)

## Required Files

- ✅ `icon.png` (1024x1024) - Main app icon
- ✅ `splash.png` (1284x2778) - Splash screen
- ✅ `adaptive-icon.png` (1024x1024) - Android icon
- ✅ `favicon.png` (48x48) - Web favicon

## Colors Used in App
- Primary: `#6200EE` (Purple)
- Secondary: `#03DAC6` (Teal)
- Background: `#FFFFFF` (White)

## Quick Fix
For now, you can comment out the icon references in `app.json` to run the app with Expo defaults.
