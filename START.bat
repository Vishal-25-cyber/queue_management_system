@echo off
REM Hospital Queue Management System - Quick Start Script for Windows

echo.
echo ============================================================
echo    Hospital Queue Management System - Startup Script
echo ============================================================
echo.

REM Check if backend folder exists
if not exist "backend" (
    echo ERROR: backend folder not found!
    echo Please run this script from the root directory
    pause
    exit /b 1
)

REM Check if frontend folder exists
if not exist "frontend" (
    echo ERROR: frontend folder not found!
    echo Please run this script from the root directory
    pause
    exit /b 1
)

echo Step 1: Checking Backend Setup...
echo.

if exist "backend\.env" (
    echo [OK] backend\.env found
) else (
    echo [SETUP] Creating backend\.env from .env.example...
    if exist "backend\.env.example" (
        copy backend\.env.example backend\.env
        echo [OK] backend\.env created. Please update MONGODB_URI!
    ) else (
        echo [ERROR] backend\.env.example not found!
        pause
        exit /b 1
    )
)

echo.
echo Step 2: Checking Frontend Setup...
echo.

if exist "frontend\.env" (
    echo [OK] frontend\.env found
) else (
    echo [SETUP] Creating frontend\.env from .env.example...
    if exist "frontend\.env.example" (
        copy frontend\.env.example frontend\.env
        echo [OK] frontend\.env created
    ) else (
        echo [ERROR] frontend\.env.example not found!
        pause
        exit /b 1
    )
)

echo.
echo Step 3: Starting Backend Server...
echo.
echo Open a new terminal and run: cd backend ^&^& npm install ^&^& npm run dev
echo.
echo Press any key to open PowerShell terminal for backend...
pause

powershell -Command "Start-Process powershell -ArgumentList 'cd \"$PWD\backend\"; npm install; npm run dev'"

echo.
echo Step 4: Starting Frontend Server...
echo.
echo A new terminal window should have opened for the backend.
echo Now starting frontend in a new terminal...
echo.
echo Press any key to open another PowerShell terminal for frontend...
pause

powershell -Command "Start-Process powershell -ArgumentList 'cd \"$PWD\frontend\"; npm install; npm run dev'"

echo.
echo ============================================================
echo    Startup Complete!
echo ============================================================
echo.
echo Backend URL: http://localhost:5000
echo Frontend URL: http://localhost:5173
echo.
echo If both servers started successfully, open:
echo http://localhost:5173
echo.
echo Troubleshooting:
echo - Ensure MongoDB is running (local or Atlas)
echo - Check backend\.env has correct MONGODB_URI
echo - Check internet connection for MongoDB Atlas
echo.
pause
