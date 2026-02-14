# 📤 Commit & Push Guide

Quick guide to commit all changes and push to GitHub.

## ✅ Pre-Commit Checklist

Before committing, verify:

- [ ] All files are in English (including comments)
- [ ] Virtual environment (`.venv/`) is in `.gitignore`
- [ ] No sensitive data in files
- [ ] All documentation is complete
- [ ] Code is tested and working

## 🚀 Commit Everything

### Step 1: Check Status

```bash
git status
```

You should see:
- New files (documentation, scripts, organized folders)
- Modified files (if any)
- `.venv/` should NOT appear (it's in `.gitignore`)

### Step 2: Add All Files

```bash
git add .
```

### Step 3: Commit with Message

```bash
git commit -m "docs: Add complete team setup, documentation, and project organization

- Add comprehensive setup guides (SETUP.md, QUICKSTART.md)
- Add contribution guidelines (CONTRIBUTING.md)
- Add team onboarding checklist (TEAM_ONBOARDING.md)
- Add verification tools (verify_venv.py, VERIFY_SETUP.md)
- Organize project structure (css/, js/, images/, pages/)
- Add Python virtual environment setup scripts
- Add VS Code configuration and recommended extensions
- Update .gitignore for Python and virtual environments
- Add requirements.txt for Python dependencies
- Update README with new structure and setup instructions"
```

### Step 4: Push to GitHub

```bash
git push origin main
```

## 📋 What Will Be Pushed

### Documentation (7 files)
- `README.md` - Project overview
- `SETUP.md` - Complete setup guide
- `QUICKSTART.md` - Quick start guide
- `CONTRIBUTING.md` - Contribution guidelines
- `TEAM_ONBOARDING.md` - Onboarding checklist
- `VERIFY_SETUP.md` - Verification guide
- `PROJECT_SUMMARY.md` - Project summary
- `COMMIT_GUIDE.md` - This file

### Configuration Files
- `.gitignore` - Git ignore rules
- `requirements.txt` - Python dependencies
- `.vscode/settings.json` - VS Code settings
- `.vscode/extensions.json` - Recommended extensions

### Setup Scripts
- `setup_venv.sh` - Setup script for macOS/Linux
- `setup_venv.bat` - Setup script for Windows
- `verify_venv.py` - Verification script

### Project Files
- `index.html` - Main page
- `pages/*.html` - Internal pages (3 files)
- `css/*.css` - Stylesheets (4 files)
- `js/*.js` - JavaScript files (4 files)
- `images/*.png` - Images (3 files)

## ❌ What Will NOT Be Pushed

These are in `.gitignore`:
- `.venv/` - Virtual environment
- `__pycache__/` - Python cache
- `*.pyc` - Python compiled files
- `.DS_Store` - macOS files
- `Thumbs.db` - Windows files
- `node_modules/` - Node packages (if added later)

## 🔍 Verify Before Pushing

### Check What Will Be Committed

```bash
git diff --cached
```

### Check Ignored Files

```bash
git status --ignored
```

You should see `.venv/` in the ignored list.

### Verify .gitignore is Working

```bash
# This should return nothing (empty)
git ls-files --others --ignored --exclude-standard | grep .venv
```

## 🌐 After Pushing

### Verify on GitHub

1. Go to https://github.com/puddl3duck/glowcycle
2. Check that all files are there
3. Verify `.venv/` is NOT in the repository
4. Check that README displays correctly

### Share with Team

Send them:
1. Repository link: https://github.com/puddl3duck/glowcycle
2. Tell them to read `QUICKSTART.md` first
3. Point them to `TEAM_ONBOARDING.md` for full onboarding

## 📝 Commit Message Format

For future commits, use this format:

```
type: Brief description (50 chars or less)

More detailed explanation if needed (wrap at 72 chars).

Fixes #issue-number
```

### Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Examples:

```bash
# New feature
git commit -m "feat: Add calendar view to cycle tracking"

# Bug fix
git commit -m "fix: Resolve navbar overlap on mobile devices"

# Documentation
git commit -m "docs: Update setup instructions for Windows users"

# Multiple changes
git commit -m "feat: Add mood analytics dashboard

- Add chart visualization
- Add date range selector
- Add export functionality

Fixes #42"
```

## 🔄 Daily Workflow

### Morning

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Activate virtual environment
.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate    # macOS/Linux
```

### During Work

```bash
# Check status frequently
git status

# Commit small changes often
git add .
git commit -m "feat: Add feature description"
```

### End of Day

```bash
# Push your branch
git push origin feature/your-feature

# Deactivate virtual environment
deactivate
```

## 🆘 Common Issues

### Issue: "Everything up-to-date"

**Cause:** No changes to commit

**Solution:** Make sure you've added files:
```bash
git add .
git status  # Verify files are staged
```

### Issue: ".venv appears in git status"

**Cause:** `.gitignore` not working

**Solution:**
```bash
# Remove from tracking
git rm -r --cached .venv

# Verify .gitignore includes .venv/
cat .gitignore | grep .venv

# Commit the change
git add .gitignore
git commit -m "fix: Ensure .venv is ignored"
```

### Issue: "Push rejected"

**Cause:** Remote has changes you don't have

**Solution:**
```bash
# Pull first
git pull origin main

# Resolve conflicts if any
# Then push again
git push origin main
```

### Issue: "Large files warning"

**Cause:** Trying to commit large files

**Solution:**
```bash
# Check file sizes
git ls-files -s | awk '{print $4, $2}' | sort -n

# Add large files to .gitignore
echo "large-file.zip" >> .gitignore
git add .gitignore
```

## ✅ Final Checklist

Before pushing:

- [ ] `git status` shows only intended files
- [ ] `.venv/` is NOT in the list
- [ ] All files are in English
- [ ] Commit message is clear and descriptive
- [ ] No sensitive data (passwords, API keys)
- [ ] Documentation is up to date
- [ ] Code is tested locally

## 🎯 Quick Commands

```bash
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "type: description"

# Push
git push origin main

# Pull latest
git pull origin main

# Create branch
git checkout -b feature/name

# Switch branch
git checkout main

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all changes
git reset --hard HEAD
```

---

**Ready to push? Run these commands:**

```bash
git add .
git commit -m "docs: Add complete team setup and documentation"
git push origin main
```

**Then share the repository with your team! 🚀**
