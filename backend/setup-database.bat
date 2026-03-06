@echo off
echo ================================
echo Smart Bus System - MongoDB Setup
echo ================================
echo.

echo This script will:
echo 1. Connect to MongoDB (localhost:27017)
echo 2. Seed sample data into the database
echo.

echo Make sure MongoDB is installed and running!
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo Step 1: Testing MongoDB connection...
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/smart_bus_db').then(() => { console.log('\n✓ MongoDB connection successful!\n'); process.exit(0); }).catch((err) => { console.error('\n✗ MongoDB connection failed:', err.message, '\n'); process.exit(1); });"

if %ERRORLEVEL% EQU 0 (
    echo Step 2: Seeding database with sample data...
    cd /d "%~dp0"
    node src/database/seed.js
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ================================
        echo ✓ Database setup complete!
        echo ================================
        echo.
        echo Test Credentials:
        echo   Admin:     admin@smartbus.com / admin123
        echo   Passenger: passenger@test.com / password123
        echo.
        echo You can now start the server:
        echo   npm run dev
        echo.
    ) else (
        echo ✗ Error seeding database
    )
) else (
    echo ✗ Error connecting to MongoDB
    echo.
    echo Make sure MongoDB is installed and running:
    echo   - Download: https://www.mongodb.com/try/download/community
    echo   - Start service: net start MongoDB
    echo   - Or use MongoDB Compass
    echo.
    echo See MONGODB_SETUP.md for detailed instructions
)

echo.
pause
