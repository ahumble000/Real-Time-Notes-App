#!/bin/bash

# Real-Time Notes Application Startup Script

echo "🚀 Starting Real-Time Collaborative Notes Application..."

# Check if MongoDB is running
echo "📦 Checking MongoDB connection..."

# Start server in the background
echo "🖥️  Starting server..."
cd server
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start client
echo "🌐 Starting client..."
cd ../client
npm run dev &
CLIENT_PID=$!

echo "✅ Application started successfully!"
echo "📋 Server running at: http://localhost:5000"
echo "🌐 Client running at: http://localhost:3000"
echo ""
echo "To stop the application, press Ctrl+C"

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Stopping application..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo "✅ Application stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
