# 👥 Team Onboarding Checklist

Welcome to the Glow Cycle team! Use this checklist to get fully onboarded.

## 📅 Day 1: Setup & Access

### Software Installation
- [ ] Install [Git](https://git-scm.com/downloads)
- [ ] Install [Python 3.8+](https://www.python.org/downloads/)
- [ ] Install [VS Code](https://code.visualstudio.com/)
- [ ] Install [GitHub Desktop](https://desktop.github.com/) (optional)

### GitHub Access
- [ ] Create GitHub account (if needed)
- [ ] Get added to the repository
- [ ] Set up Git credentials
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```
- [ ] Set up SSH key (optional but recommended)

### Project Setup
- [ ] Clone repository: `git clone https://github.com/puddl3duck/glowcycle.git`
- [ ] Run setup script:
  - Windows: `setup_venv.bat`
  - macOS/Linux: `bash setup_venv.sh`
- [ ] Open in VS Code: `code .`
- [ ] Install recommended VS Code extensions

### Verify Setup
- [ ] Virtual environment activates successfully
- [ ] Can open `index.html` with Live Server
- [ ] Website loads at `http://localhost:5500`
- [ ] Can create and switch branches
- [ ] Python interpreter selected in VS Code

## 📚 Day 2: Learn the Codebase

### Documentation Review
- [ ] Read `README.md` - Project overview
- [ ] Read `SETUP.md` - Full setup guide
- [ ] Read `CONTRIBUTING.md` - How to contribute
- [ ] Skim `QUICKSTART.md` - Quick reference

### Code Exploration
- [ ] Explore project structure
  - [ ] `index.html` - Main landing page
  - [ ] `css/` - All stylesheets
  - [ ] `js/` - All JavaScript files
  - [ ] `pages/` - Internal pages
  - [ ] `images/` - Image assets
- [ ] Open and review each HTML page
- [ ] Check CSS organization
- [ ] Review JavaScript functionality

### Design System
- [ ] Review color palette in CSS variables
- [ ] Understand typography (Playfair Display + Outfit)
- [ ] Note animation patterns
- [ ] Understand component structure

## 🎯 Day 3: First Contribution

### Pick Your First Task
- [ ] Browse [GitHub Issues](https://github.com/puddl3duck/glowcycle/issues)
- [ ] Look for issues labeled `good first issue`
- [ ] Comment on an issue to claim it
- [ ] Wait for assignment confirmation

### Make Your First Change
- [ ] Create a new branch: `git checkout -b feature/your-name-first-task`
- [ ] Make a small change (fix typo, update comment, etc.)
- [ ] Test your change locally
- [ ] Commit: `git commit -m "Your message"`
- [ ] Push: `git push origin feature/your-name-first-task`

### Create Your First PR
- [ ] Go to GitHub and create Pull Request
- [ ] Fill out PR description
- [ ] Request review from team member
- [ ] Address any feedback
- [ ] Celebrate your first contribution! 🎉

## 🤝 Ongoing: Team Integration

### Communication
- [ ] Join team chat/Slack/Discord
- [ ] Introduce yourself to the team
- [ ] Set up notification preferences
- [ ] Add team calendar (if applicable)

### Workflow Understanding
- [ ] Understand branch naming conventions
- [ ] Learn commit message format
- [ ] Know when to create issues vs discussions
- [ ] Understand PR review process

### Best Practices
- [ ] Always pull latest changes before starting work
- [ ] Create feature branches, never commit to main
- [ ] Write clear commit messages
- [ ] Test thoroughly before pushing
- [ ] Ask questions when stuck

## 📖 Resources to Bookmark

### Project Resources
- Repository: https://github.com/puddl3duck/glowcycle
- Issues: https://github.com/puddl3duck/glowcycle/issues
- Pull Requests: https://github.com/puddl3duck/glowcycle/pulls
- Discussions: https://github.com/puddl3duck/glowcycle/discussions

### Learning Resources
- [MDN Web Docs](https://developer.mozilla.org/) - HTML/CSS/JS
- [Git Documentation](https://git-scm.com/doc) - Git commands
- [VS Code Tips](https://code.visualstudio.com/docs) - Editor tips
- [Python Docs](https://docs.python.org/3/) - Python reference

### Tools
- [W3C HTML Validator](https://validator.w3.org/)
- [W3C CSS Validator](https://jigsaw.w3.org/css-validator/)
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Color Picker](https://htmlcolorcodes.com/) - Color tools

## 🎓 Skills to Develop

### Essential (Start Here)
- [ ] HTML5 semantic elements
- [ ] CSS Flexbox and Grid
- [ ] Basic JavaScript (DOM manipulation)
- [ ] Git basics (clone, branch, commit, push)
- [ ] VS Code shortcuts

### Intermediate (Next Steps)
- [ ] CSS animations and transitions
- [ ] JavaScript ES6+ features
- [ ] localStorage API
- [ ] Responsive design principles
- [ ] Git branching strategies

### Advanced (Future Goals)
- [ ] Python basics (for future backend)
- [ ] API integration
- [ ] Testing frameworks
- [ ] Performance optimization
- [ ] Accessibility (WCAG)

## 🆘 Common Issues & Solutions

### "Can't activate virtual environment"
```bash
# Windows PowerShell - Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Live Server not working"
1. Make sure extension is installed
2. Right-click on HTML file (not in terminal)
3. Restart VS Code if needed

### "Git push rejected"
```bash
# Pull latest changes first
git pull origin main
# Resolve any conflicts
# Then push again
git push origin your-branch
```

### "Python not found"
- Make sure Python is installed
- Check it's in your PATH
- Try `python3` instead of `python` (macOS/Linux)

## ✅ Onboarding Complete!

Once you've checked off all items:
- [ ] You can work independently on issues
- [ ] You understand the codebase structure
- [ ] You've made at least one contribution
- [ ] You know where to find help
- [ ] You're comfortable with the workflow

## 🎉 Welcome to the Team!

You're now ready to contribute to Glow Cycle. Remember:
- Ask questions - there are no stupid questions
- Take your time - quality over speed
- Help others - we're a team
- Have fun - enjoy the journey!

**Questions?** Ask in team chat or create a GitHub discussion.

---

**Made with 💜 by the Glow Cycle team**
