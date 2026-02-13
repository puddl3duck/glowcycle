#!/bin/bash
# Setup script for macOS/Linux

echo "========================================"
echo "Glow Cycle - Virtual Environment Setup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python from https://www.python.org/downloads/"
    exit 1
fi

echo "[1/3] Creating virtual environment..."
python3 -m venv .venv
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create virtual environment"
    exit 1
fi

echo "[2/3] Activating virtual environment..."
source .venv/bin/activate

echo "[3/3] Upgrading pip..."
python -m pip install --upgrade pip

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Virtual environment is now active."
echo "You can deactivate it by typing: deactivate"
echo ""
echo "Next steps:"
echo "1. Open VS Code: code ."
echo "2. Install recommended extensions"
echo "3. Open index.html with Live Server"
echo ""
