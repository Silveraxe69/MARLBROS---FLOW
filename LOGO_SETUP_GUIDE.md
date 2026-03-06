# 🎨 Logo Setup Guide

## Folders Created for Your Logos

I've created the following folders where you can save your TNSTC logo:

### 📁 Admin Dashboard Logo
**Location:** 
```
admin-dashboard/public/images/
```

**File to save:**
- `tnstc-logo.png` (200x200px to 512x512px recommended)

**Where it appears:**
- ✅ AppBar header (top navigation bar)
- ✅ Login page (center, large logo)
- ⚠️ Automatically falls back to bus icon if not found

---

### 📁 Passenger Mobile App Logo  
**Location:**
```
passenger-app/assets/images/
```

**File to save:**
- `tnstc-logo.png` (512x512px to 1024x1024px recommended)

**Where it appears:**
- ✅ Login screen
- ✅ Registration screen  
- ⚠️ Automatically falls back to bus emoji 🚌 if not found

---

## 📋 Quick Steps:

1. **Save your logo files** in the locations above with the exact filename `tnstc-logo.png`

2. **For Admin Dashboard:**
   - Refresh your browser (Ctrl + F5 or Cmd + Shift + R)
   - Logo will appear immediately

3. **For Passenger App:**
   - Reload the app in Expo Go (shake device → "Reload" or press 'r' in terminal)
   - Logo will replace the emoji

---

## 🎯 Logo Specifications

### Recommended Format:
- **PNG** with transparent background (preferred)
- **SVG** for scalability (admin dashboard only)
- **JPG** works but no transparency

### Recommended Sizes:
- **Admin Dashboard:** 200x200px or 512x512px
- **Mobile App:** 512x512px or 1024x1024px (larger for better quality)

### Design Tips:
- Use the official Tamil Nadu State Transport Corporation logo from their website
- The logo should include the TN government emblem (temple gopuram symbol)
- Ensure good contrast against blue background (#1565C0 - Official TNSTC Blue)
- The logo typically has the emblem with traditional colors on white/transparent background
- Should include both Tamil and English text: "Tamil Nadu State Transport Corporation Ltd."

---

## 🔧 Technical Details  

### Admin Dashboard Implementation:
- Uses `<img>` tag with error handling
- Path: `/images/tnstc-logo.png` (served from public folder)
- Falls back to DirectionsBusIcon on error
- No code changes needed after saving logo

### Passenger App Implementation:
- Uses custom `<Logo>` component with try-catch
- Path: `../../assets/images/tnstc-logo.png`
- Falls back to 🚌 emoji on error
- Supports dynamic sizing via props
- Located at: `passenger-app/src/components/Logo.js`
- Theme: Official TNSTC Blue (#1565C0)

---

## 📂 Folder Structure:

```
flow-bus-system/
├── admin-dashboard/
│   └── public/
│       └── images/               ← SAVE ADMIN LOGO HERE
│           ├── tnstc-logo.png   ← Your logo file
│           └── README.md         ← Instructions
│
└── passenger-app/
    └── assets/
        └── images/               ← SAVE MOBILE LOGO HERE
            ├── tnstc-logo.png   ← Your logo file
            └── README.md         ← Instructions
```

---

## ✅ Status:

- [x] Folders created
- [x] Code updated to use logos
- [x] Error handling implemented  
- [x] Fallback icons configured
- [ ] **YOU: Save logo files** → `tnstc-logo.png` in both folders
- [ ] **YOU: Refresh/reload** to see the logos

---

## 🆘 Troubleshooting:

**Logo not showing?**
1. Check filename is exactly `tnstc-logo.png` (lowercase, no spaces)
2. Check file is in correct folder (see paths above)
3. Refresh browser / reload app
4. Check browser console / Expo terminal for errors

**Logo looks pixelated?**
- Use a higher resolution image (at least 512x512px)
- Use PNG or SVG format for better quality

**Blue background (#1565C0) works best with the official TNSTC logo
- The official logo has the government emblem with traditional colors
- Use the logo as-is from the TNSTC website
- Transparent background PNG works best
- Or use transparent background with white design

---

💡 **Need help?** Check the README.md files in each images folder for more details!
