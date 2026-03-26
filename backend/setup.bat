@echo off
echo Setting up Lakta Backend...
echo.

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Backend setup complete!
echo.
echo Next steps:
echo   1. Copy .env.example to .env and update DATABASE_URL
echo   2. Run: alembic upgrade head
echo   3. Run: uvicorn app.main:app --reload
echo.

pause
