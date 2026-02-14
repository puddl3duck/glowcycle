# ✅ Verify Your Setup

Quick guide to verify your development environment is correctly configured.

## 🔍 Quick Verification

### Method 1: Run Verification Script (Recommended)

```bash
# Activate virtual environment first
# Windows PowerShell:
.venv\Scripts\Activate.ps1

# macOS/Linux:
source .venv/bin/activate

# Run verification
python verify_venv.py
```

**Expected Output:**
```
============================================================
🐍 VIRTUAL ENVIRONMENT VERIFICATION
============================================================

✓ Python Version: 3.x.x
✓ Python Executable: .../glowcycle/.venv/Scripts/python.exe
✓ Virtual Environment Status: ✅ ACTIVE
✓ pip Version: x.x.x
✓ Project Structure: All files exist
✓ Installed Packages: Listed

============================================================
✅ ALL CHECKS PASSED - Your environment is ready!
============================================================
```

### Method 2: Manual Verification

#### 1. Check Virtual Environment Exists

**Windows:**
```powershell
Test-Path .venv
# Should return: True
```

**macOS/Linux:**
```bash
ls -la .venv
# Should show: Scripts/ (Windows) or bin/ (macOS/Linux)
```

#### 2. Activate Virtual Environment

**Windows PowerShell:**
```powershell
.venv\Scripts\Activate.ps1
```

**Windows CMD:**
```cmd
.venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

**You should see `(.venv)` at the beginning of your prompt:**
```
(.venv) PS C:\Users\YourName\glowcycle>
```

#### 3. Verify Python Location

```bash
# Windows
where python

# macOS/Linux
which python
```

**Expected:** Path should point to `.venv` folder
```
C:\Users\YourName\glowcycle\.venv\Scripts\python.exe
```

#### 4. Check Python Version

```bash
python --version
```

**Expected:** Python 3.8 or higher

#### 5. Check pip Version

```bash
pip --version
```

**Expected:** pip should be from `.venv` folder
```
pip 26.0.1 from C:\Users\...\glowcycle\.venv\Lib\site-packages\pip (python 3.14)
```

#### 6. Verify Environment Variable

**Windows PowerShell:**
```powershell
$env:VIRTUAL_ENV
```

**macOS/Linux:**
```bash
echo $VIRTUAL_ENV
```

**Expected:** Path to your `.venv` folder
```
C:\Users\YourName\glowcycle\.venv
```

## 🧪 Test Installation

### Install a Test Package

```bash
# Make sure virtual environment is active
pip install requests

# Verify installation
pip list
```

**Expected:** You should see `requests` in the list

### Remove Test Package

```bash
pip uninstall requests -y
```

## 📋 Verification Checklist

Use this checklist to ensure everything is working:

- [ ] `.venv` folder exists in project root
- [ ] Virtual environment activates without errors
- [ ] Prompt shows `(.venv)` when active
- [ ] `python --version` shows Python 3.8+
- [ ] `pip --version` shows pip from `.venv` folder
- [ ] `$env:VIRTUAL_ENV` (Windows) or `$VIRTUAL_ENV` (macOS/Linux) shows correct path
- [ ] `python verify_venv.py` passes all checks
- [ ] Can install and uninstall packages with pip
- [ ] VS Code recognizes the Python interpreter from `.venv`

## 🐛 Common Issues

### Issue 1: "Activate.ps1 cannot be loaded"

**Windows PowerShell Error:**
```
.venv\Scripts\Activate.ps1 : File cannot be loaded because running scripts is disabled
```

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 2: Virtual Environment Not Activating

**Symptoms:** No `(.venv)` in prompt

**Solutions:**
1. Make sure you're in the project root directory
2. Try using the full path:
   ```powershell
   # Windows
   C:\Users\YourName\glowcycle\.venv\Scripts\Activate.ps1
   ```
3. Recreate the virtual environment:
   ```bash
   # Delete old one
   Remove-Item -Recurse -Force .venv
   
   # Create new one
   python -m venv .venv
   ```

### Issue 3: Wrong Python Version

**Symptoms:** `python --version` shows system Python, not `.venv` Python

**Solutions:**
1. Deactivate and reactivate:
   ```bash
   deactivate
   .venv\Scripts\Activate.ps1
   ```
2. Close and reopen terminal
3. Restart VS Code

### Issue 4: pip Not Found

**Symptoms:** `pip: command not found`

**Solutions:**
1. Use `python -m pip` instead:
   ```bash
   python -m pip --version
   ```
2. Upgrade pip:
   ```bash
   python -m pip install --upgrade pip
   ```

### Issue 5: VS Code Not Recognizing Virtual Environment

**Solutions:**
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "Python: Select Interpreter"
3. Choose the interpreter from `.venv` folder
4. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"

## 🔄 Daily Workflow Verification

### Start of Day

```bash
# 1. Navigate to project
cd glowcycle

# 2. Pull latest changes
git pull origin main

# 3. Activate virtual environment
.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate    # macOS/Linux

# 4. Verify it's active
python verify_venv.py

# 5. Start coding!
```

### End of Day

```bash
# 1. Deactivate virtual environment
deactivate

# 2. Close VS Code
```

## 📊 Expected File Structure

After setup, your `.venv` folder should contain:

**Windows:**
```
.venv/
├── Include/
├── Lib/
│   └── site-packages/
└── Scripts/
    ├── Activate.ps1
    ├── activate.bat
    ├── python.exe
    └── pip.exe
```

**macOS/Linux:**
```
.venv/
├── bin/
│   ├── activate
│   ├── python
│   └── pip
├── include/
└── lib/
    └── python3.x/
        └── site-packages/
```

## 🎯 Quick Commands Reference

```bash
# Create virtual environment
python -m venv .venv

# Activate
.venv\Scripts\Activate.ps1        # Windows PowerShell
.venv\Scripts\activate.bat        # Windows CMD
source .venv/bin/activate         # macOS/Linux

# Deactivate
deactivate

# Verify setup
python verify_venv.py

# Check Python location
where python                      # Windows
which python                      # macOS/Linux

# Check if active
echo $env:VIRTUAL_ENV             # Windows PowerShell
echo $VIRTUAL_ENV                 # macOS/Linux

# Upgrade pip
python -m pip install --upgrade pip

# Install packages
pip install -r requirements.txt

# List installed packages
pip list

# Freeze current packages
pip freeze > requirements.txt
```

## ✅ Success Indicators

Your setup is correct when:

1. ✅ `(.venv)` appears in your terminal prompt
2. ✅ `python --version` shows your Python version
3. ✅ `pip --version` shows pip from `.venv` folder
4. ✅ `python verify_venv.py` passes all checks
5. ✅ VS Code shows correct Python interpreter in bottom-left
6. ✅ You can install packages without `sudo` or admin rights

## 🆘 Still Having Issues?

1. **Read the full setup guide**: `SETUP.md`
2. **Check troubleshooting section**: `SETUP.md` → Troubleshooting
3. **Ask in team chat**: Someone might have faced the same issue
4. **Create a GitHub issue**: Include error messages and screenshots

---

**Pro Tip:** Run `python verify_venv.py` whenever you're unsure if your environment is set up correctly!
