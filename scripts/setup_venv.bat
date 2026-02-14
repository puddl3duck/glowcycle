@echo off
REM Setup script for Windows
echo ========================================
echo Glow Cycle - Virtual Environment Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/3] Creating virtual environment...
python -m venv .venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/3] Activating virtual environment...
call .venv\Scripts\activate.bat

echo [3/3] Upgrading pip...
python -m pip install --upgrade pip

echo.
echo ========================================
echo Setup Complete! 
echo ========================================
echo.
echo Virtual environment is now active.
echo You can deactivate it by typing: deactivate
echo.
echo Next steps:
echo 1. Open VS Code: code .
echo 2. Install recommended extensions
echo 3. Open index.html with Live Server
echo.
pause
