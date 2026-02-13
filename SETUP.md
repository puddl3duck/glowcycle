# 🚀 Glow Cycle - Development Setup Guide

Complete setup instructions for the Glow Cycle project. Follow these steps to get your development environment ready.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Git**: [Download Git](https://git-scm.com/downloads)
- **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
- **VS Code**: [Download VS Code](https://code.visualstudio.com/)
- **Node.js** (optional, for future features): [Download Node.js](https://nodejs.org/)

### Verify Installations

Open your terminal and run:

```bash
git --version
python --version  # or python3 --version on macOS/Linux
```

---

## 🔧 Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/puddl3duck/glowcycle.git
cd glowcycle
```

### 2. Open in VS Code

```bash
code .
```

---

## 🐍 Python Virtual Environment Setup

### Why Use a Virtual Environment?

A virtual environment keeps your project dependencies isolated and ensures everyone on the team has the same package versions.

### Create Virtual Environment

**Windows (PowerShell/CMD):**
```bash
python -m venv .venv
```

**macOS/Linux:**
```bash
python3 -m venv .venv
```

### Activate Virtual Environment

**Windows (PowerShell):**
```bash
.venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```bash
.venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

**You'll know it's activated when you see `(.venv)` at the beginning of your terminal prompt.**

### Deactivate Virtual Environment

When you're done working:
```bash
deactivate
```

---

## 📦 Installing Dependencies

### Current Project Dependencies

Right now, this is a **pure HTML/CSS/JavaScript project** with no Python dependencies yet. However, we're preparing for future Python features.

### When Python Dependencies Are Added

Once we add Python packages, install them with:

```bash
# Make sure your virtual environment is activated first!
pip install -r requirements.txt
```

### Adding New Packages

If you need to add a new Python package:

```bash
# Install the package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

---

## 🎨 VS Code Setup

### Recommended Extensions

Install these VS Code extensions for the best development experience:

1. **Python** (Microsoft) - Python language support
2. **Pylance** (Microsoft) - Python IntelliSense
3. **Live Server** (Ritwick Dey) - Launch local development server
4. **Prettier** (Prettier) - Code formatter
5. **GitLens** (GitKraken) - Enhanced Git capabilities

### Select Python Interpreter

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "Python: Select Interpreter"
3. Choose the interpreter from `.venv` folder

### VS Code Settings

Create `.vscode/settings.json` (if it doesn't exist):

```json
{
  "python.defaultInterpreterPath": ".venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.python"
  }
}
```

---

## 🌐 Running the Project

### Frontend (HTML/CSS/JS)

**Option 1: Using Live Server (Recommended)**
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Your browser will open at `http://localhost:5500`

**Option 2: Direct File Opening**
1. Simply open `index.html` in your browser
2. Navigate using file:// protocol

### Future Python Backend

When we add Python backend features, instructions will be added here.

---

## 📁 Project Structure

```
glowcycle/
├── .venv/                 # Virtual environment (not in Git)
├── .vscode/               # VS Code settings
├── css/                   # Stylesheets
├── js/                    # JavaScript files
├── images/                # Image assets
├── pages/                 # Internal HTML pages
├── .gitignore            # Git ignore rules
├── index.html            # Main landing page
├── README.md             # Project overview
├── SETUP.md              # This file
└── requirements.txt      # Python dependencies (when added)
```

---

## 🔄 Git Workflow

### First Time Setup

```bash
# Configure Git (if not done already)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create a new branch for your feature
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git add .
git commit -m "Description of your changes"

# 4. Push your branch
git push origin feature/your-feature-name

# 5. Create a Pull Request on GitHub
```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-calendar`)
- `fix/` - Bug fixes (e.g., `fix/navbar-mobile`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `style/` - UI/styling changes (e.g., `style/improve-colors`)

---

## 🐛 Troubleshooting

### Python Virtual Environment Issues

**Problem: "Activate.ps1 cannot be loaded" (Windows)**
```bash
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Problem: Wrong Python version**
```bash
# Specify Python version explicitly
python3.11 -m venv .venv  # Replace 3.11 with your version
```

**Problem: pip not found**
```bash
# Make sure virtual environment is activated
# Then upgrade pip
python -m pip install --upgrade pip
```

### VS Code Issues

**Problem: Python interpreter not found**
1. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Manually select interpreter: `Ctrl+Shift+P` → "Python: Select Interpreter"

**Problem: Live Server not working**
1. Make sure extension is installed
2. Right-click on `index.html` (not in terminal)
3. Try restarting VS Code

### Git Issues

**Problem: Permission denied (publickey)**
```bash
# Set up SSH key for GitHub
ssh-keygen -t ed25519 -C "your.email@example.com"
# Follow GitHub's SSH setup guide
```

**Problem: Merge conflicts**
```bash
# Pull latest changes first
git pull origin main
# Resolve conflicts in VS Code
# Then commit the resolution
git add .
git commit -m "Resolve merge conflicts"
```

---

## 📚 Additional Resources

### Learning Resources

- **HTML/CSS/JS**: [MDN Web Docs](https://developer.mozilla.org/)
- **Python**: [Python Official Tutorial](https://docs.python.org/3/tutorial/)
- **Git**: [Git Documentation](https://git-scm.com/doc)
- **VS Code**: [VS Code Tips](https://code.visualstudio.com/docs)

### Project-Specific

- **Repository**: https://github.com/puddl3duck/glowcycle
- **Issues**: Report bugs or request features on GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

---

## ✅ Quick Start Checklist

Use this checklist for new team members:

- [ ] Install Git, Python, VS Code
- [ ] Clone repository
- [ ] Create virtual environment (`.venv`)
- [ ] Activate virtual environment
- [ ] Install VS Code extensions
- [ ] Select Python interpreter in VS Code
- [ ] Open `index.html` with Live Server
- [ ] Verify everything works
- [ ] Create a test branch
- [ ] Make a small change and commit
- [ ] Push to GitHub

---

## 🤝 Team Communication

### Before Starting Work

1. Check GitHub Issues for assigned tasks
2. Pull latest changes from `main`
3. Create a new branch for your work

### During Development

1. Commit frequently with clear messages
2. Push your branch regularly
3. Ask questions in team chat or GitHub Discussions

### After Completing Work

1. Test your changes thoroughly
2. Update documentation if needed
3. Create a Pull Request
4. Request review from team members

---

## 📝 Code Style Guidelines

### HTML
- Use semantic HTML5 elements
- Indent with 4 spaces
- Use lowercase for tags and attributes
- Add comments for major sections

### CSS
- Use CSS custom properties (variables)
- Follow BEM naming convention when applicable
- Group related properties together
- Add comments for complex styles

### JavaScript
- Use `const` and `let`, avoid `var`
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### Python (when added)
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions/classes
- Keep functions under 50 lines when possible

---

## 🎯 Next Steps

Once you've completed the setup:

1. Explore the codebase
2. Read the main `README.md`
3. Check open Issues on GitHub
4. Join the team communication channel
5. Start with a small task to get familiar

---

**Need Help?** 

- 💬 Ask in team chat
- 🐛 Create an issue on GitHub
- 📧 Contact the project lead

**Happy Coding! 🌸✨**
