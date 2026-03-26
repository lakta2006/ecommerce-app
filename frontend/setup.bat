@echo off
echo Setting up Lakta Frontend...
echo.

echo Installing dependencies...
call npm install --legacy-peer-deps

echo.
echo Frontend setup complete!
echo.
echo To start the development server, run:
echo   npm run dev
echo.

pause
