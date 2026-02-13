#!/usr/bin/env python3
"""
Virtual Environment Verification Script
Run this to check if your virtual environment is properly set up and active.
"""

import sys
import os
from pathlib import Path

def check_venv():
    """Check if virtual environment is active and properly configured."""
    
    print("=" * 60)
    print("🐍 VIRTUAL ENVIRONMENT VERIFICATION")
    print("=" * 60)
    print()
    
    # Check 1: Python version
    print("✓ Python Version:")
    print(f"  {sys.version}")
    print()
    
    # Check 2: Python executable location
    print("✓ Python Executable:")
    print(f"  {sys.executable}")
    print()
    
    # Check 3: Virtual environment active
    venv_active = hasattr(sys, 'real_prefix') or (
        hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
    )
    
    print("✓ Virtual Environment Status:")
    if venv_active:
        print("  ✅ ACTIVE - Virtual environment is running")
        venv_path = os.environ.get('VIRTUAL_ENV', sys.prefix)
        print(f"  📁 Location: {venv_path}")
    else:
        print("  ❌ NOT ACTIVE - Please activate virtual environment")
        print()
        print("  To activate:")
        print("    Windows PowerShell: .venv\\Scripts\\Activate.ps1")
        print("    Windows CMD:        .venv\\Scripts\\activate.bat")
        print("    macOS/Linux:        source .venv/bin/activate")
    print()
    
    # Check 4: pip version
    try:
        import pip
        print("✓ pip Version:")
        print(f"  {pip.__version__}")
    except ImportError:
        print("❌ pip not found")
    print()
    
    # Check 5: Project structure
    print("✓ Project Structure:")
    project_root = Path(__file__).parent
    
    required_dirs = ['css', 'js', 'images', 'pages']
    required_files = ['index.html', 'README.md', 'requirements.txt']
    
    all_good = True
    for dir_name in required_dirs:
        dir_path = project_root / dir_name
        if dir_path.exists():
            print(f"  ✅ {dir_name}/ exists")
        else:
            print(f"  ❌ {dir_name}/ missing")
            all_good = False
    
    for file_name in required_files:
        file_path = project_root / file_name
        if file_path.exists():
            print(f"  ✅ {file_name} exists")
        else:
            print(f"  ❌ {file_name} missing")
            all_good = False
    print()
    
    # Check 6: Installed packages
    print("✓ Installed Packages:")
    try:
        import subprocess
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'list'],
            capture_output=True,
            text=True
        )
        packages = result.stdout.strip().split('\n')[2:]  # Skip header
        if len(packages) <= 2:  # Only pip and setuptools
            print("  📦 No additional packages installed (this is normal for now)")
        else:
            print(f"  📦 {len(packages)} packages installed:")
            for package in packages[:5]:  # Show first 5
                print(f"     {package}")
            if len(packages) > 5:
                print(f"     ... and {len(packages) - 5} more")
    except Exception as e:
        print(f"  ⚠️  Could not list packages: {e}")
    print()
    
    # Summary
    print("=" * 60)
    if venv_active and all_good:
        print("✅ ALL CHECKS PASSED - Your environment is ready!")
    elif venv_active:
        print("⚠️  Virtual environment is active but some files are missing")
    else:
        print("❌ Please activate your virtual environment first")
    print("=" * 60)
    print()
    
    return venv_active and all_good

if __name__ == "__main__":
    success = check_venv()
    sys.exit(0 if success else 1)
