# 📦 MongoDB Setup Guide

## Quick Setup (Windows)

### Option 1: Install MongoDB Community Edition (Recommended)

1. **Download MongoDB:**
   - Go to https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server (Windows x64)
   - Version 7.0 or higher recommended

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install as a Service (recommended)
   - Install MongoDB Compass (GUI tool - optional but helpful)

3. **Verify Installation:**
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service:**
   ```powershell
   net start MongoDB
   ```

### Option 2: Using Chocolatey

```powershell
choco install mongodb
```

### Option 3: Using Docker

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## 🚀 Setup Database

Once MongoDB is running:

```powershell
# Navigate to backend folder
cd backend

# Install dependencies (if not done already)
npm install

# Run setup script
.\setup-database.bat
```

Or manually:

```powershell
# Seed database
npm run db:seed

# Start server
npm run dev
```

---

## 🔍 Verify MongoDB is Running

### Check Service Status
```powershell
Get-Service MongoDB
```

### Check if MongoDB is listening
```powershell
netstat -an | findstr :27017
```

### Using MongoDB Compass
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- You should see `smart_bus_db` database after seeding

---

## 📊 MongoDB vs PostgreSQL Changes

### What Changed:
- ✅ Database: PostgreSQL → MongoDB
- ✅ Driver: `pg` → `mongoose`
- ✅ Schema: SQL tables → Mongoose models
- ✅ Queries: SQL → MongoDB queries
- ✅ Connection: Pool → Mongoose connection

### Collections Created:
- `users` - User accounts
- `routes` - Bus routes
- `busstops` - Stop locations
- `buses` - Fleet information
- `busstopsequences` - Route-stop mapping
- `buslocations` - Real-time GPS (time-series)
- `busetas` - ETA predictions
- `crowdstatuses` - Crowd levels

---

## ⚙️ Configuration

Your `.env` file should have:

```env
MONGODB_URI=mongodb://localhost:27017/smart_bus_db

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_bus_db
```

---

## 🔧 Troubleshooting

### MongoDB won't start
```powershell
# Check if port 27017 is in use
netstat -ano | findstr :27017

# Restart MongoDB service
net stop MongoDB
net start MongoDB
```

### Connection errors
- Make sure MongoDB service is running
- Check firewall settings
- Verify connection string in `.env`

### Seed fails
- Ensure CSV files exist in `data/` folder
- Check MongoDB connection
- Try running seed again: `npm run db:seed`

---

## 🌐 Using MongoDB Atlas (Cloud)

For deployment without installing MongoDB locally:

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (FREE tier available)
3. Get connection string
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_bus_db
   ```

---

## ✅ Database is Ready!

After successful setup, you should see:
- ✅ MongoDB running on port 27017
- ✅ Database `smart_bus_db` created
- ✅ 8 collections with sample data
- ✅ Server can connect and start

**Next:** Run `npm run dev` to start the server!
