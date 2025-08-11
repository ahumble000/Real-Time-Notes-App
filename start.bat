@echo off
echo 🚀 Starting Real-Time Collaborative Notes Application...

echo 📦 Starting MongoDB (make sure it's installed and accessible)...

echo 🖥️  Starting server...
cd server
start "Notes Server" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo 🌐 Starting client...
cd ..\client
start "Notes Client" cmd /k "npm run dev"

echo ✅ Application started successfully!
echo 📋 Server running at: http://localhost:5000
echo 🌐 Client running at: http://localhost:3000
echo.
echo Press any key to continue...
pause >nul
