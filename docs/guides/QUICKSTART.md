# ⚡ Quick Start Guide

**Get up and running in 5 minutes!**

## 🎯 For New Team Members

### 1️⃣ Clone & Open

```bash
git clone https://github.com/puddl3duck/glowcycle.git
cd glowcycle
code .
```

### 2️⃣ Create Virtual Environment

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3️⃣ Install VS Code Extensions

When VS Code opens, it will prompt you to install recommended extensions. Click **"Install All"**.

Or manually install:
- Python
- Live Server
- Prettier
- GitLens

### 4️⃣ Run the Project

1. Right-click on `index.html`
2. Select **"Open with Live Server"**
3. Browser opens at `http://localhost:5500`

### 5️⃣ Start Coding!

```bash
# Create a new branch
git checkout -b feature/your-name

# Make changes, then commit
git add .
git commit -m "Your changes"
git push origin feature/your-name
```

---

## 🔄 Daily Workflow

```bash
# Start of day
git pull origin main
git checkout -b feature/new-feature

# Activate virtual environment
# Windows: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate

# Work on your feature...

# End of day
git add .
git commit -m "Descriptive message"
git push origin feature/new-feature
```

---

## 📝 Common Commands

### Git
```bash
git status                    # Check what changed
git pull origin main          # Get latest code
git checkout -b feature/name  # Create new branch
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin branch-name   # Push to GitHub
```

### Python Virtual Environment
```bash
# Activate
.venv\Scripts\Activate.ps1    # Windows PowerShell
.venv\Scripts\activate.bat    # Windows CMD
source .venv/bin/activate     # macOS/Linux

# Deactivate
deactivate

# Install packages (when added)
pip install -r requirements.txt

# Add new package
pip install package-name
pip freeze > requirements.txt
```

---

## 🆘 Need Help?

- 📖 Full setup guide: See `SETUP.md`
- 🐛 Found a bug: Create an issue on GitHub
- 💬 Questions: Ask in team chat
- 📧 Urgent: Contact project lead

---

## ✅ Checklist

- [ ] Repository cloned
- [ ] Virtual environment created
- [ ] VS Code extensions installed
- [ ] Live Server working
- [ ] Can create and push branches

**All set? Start with an easy issue to get familiar with the codebase!** 🚀
