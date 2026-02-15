# 📊 Glow Cycle - Project Summary

## 🎯 Project Overview

**Glow Cycle** is a premium wellness web application designed to help women understand their skin through their menstrual cycle. The app provides cycle tracking, skin monitoring, and daily journaling features.

**Repository**: https://github.com/puddl3duck/glowcycle

## 📁 Complete Project Structure

```
glowcycle/
├── 📄 index.html                    # Main landing page
│
├── 📁 pages/                        # Internal pages
│   ├── skin-tracking.html           # Skin condition tracking
│   ├── cycle-tracking.html          # Menstrual cycle tracking
│   └── journal-mood.html            # Daily journal & mood
│
├── 📁 css/                          # Stylesheets
│   ├── styles.css                   # Main landing page styles
│   ├── skin-tracking.css            # Skin tracking styles
│   ├── cycle-tracking.css           # Cycle tracking styles
│   └── journal-mood.css             # Journal & mood styles
│
├── 📁 js/                           # JavaScript files
│   ├── script.js                    # Main landing page JS
│   ├── skin-tracking.js             # Skin tracking functionality
│   ├── cycle-tracking.js            # Cycle tracking functionality
│   └── journal-mood.js              # Journal & mood functionality
│
├── 📁 images/                       # Image assets
│   ├── hero-illustration.png        # Main hero image
│   ├── decoration-sparkle.png       # Decorative sparkle
│   └── decoration-heart.png         # Decorative heart
│
├── 📁 .vscode/                      # VS Code configuration
│   ├── settings.json                # Editor settings
│   └── extensions.json              # Recommended extensions
│
├── 📁 .venv/                        # Python virtual environment (not in Git)
│
├── 📄 README.md                     # Project overview & features
├── 📄 SETUP.md                      # Complete setup guide (9KB)
├── 📄 QUICKSTART.md                 # Quick start guide (2.5KB)
├── 📄 CONTRIBUTING.md               # Contribution guidelines (8KB)
├── 📄 TEAM_ONBOARDING.md            # Team onboarding checklist (6KB)
├── 📄 PROJECT_SUMMARY.md            # This file
│
├── 📄 requirements.txt              # Python dependencies (empty for now)
├── 📄 .gitignore                    # Git ignore rules
│
├── 🔧 setup_venv.sh                 # Setup script for macOS/Linux
└── 🔧 setup_venv.bat                # Setup script for Windows
```

## 📚 Documentation Files

### For New Team Members
1. **QUICKSTART.md** (2.5KB) - Get started in 5 minutes
2. **TEAM_ONBOARDING.md** (6KB) - Complete onboarding checklist
3. **SETUP.md** (9KB) - Detailed setup instructions

### For Contributors
1. **CONTRIBUTING.md** (8KB) - How to contribute
2. **README.md** (5KB) - Project overview

### For Reference
1. **PROJECT_SUMMARY.md** - This file
2. **requirements.txt** - Python dependencies

## 🛠️ Technology Stack

### Frontend (Current)
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, animations, glassmorphism
- **Vanilla JavaScript** - No frameworks, pure JS
- **localStorage** - Client-side data persistence

### Backend (Future)
- **Python 3.8+** - Backend language (when needed)
- **Flask/FastAPI** - Web framework (TBD)
- **SQLite/PostgreSQL** - Database (TBD)

### Development Tools
- **VS Code** - Code editor
- **Git** - Version control
- **GitHub** - Repository hosting
- **Live Server** - Development server

## 🎨 Design System

### Color Palette
```css
--bg-cream: #FAF8F5
--lavender: #D4C5E8
--lavender-light: #E8E4F3
--pink: #FFD4E5
--pink-light: #FFE8F0
--mint: #A8E6CF
--mint-light: #E3F4F4
--accent-coral: #FF9B9B
--accent-purple: #9B7EBD
--accent-pink: #FFB6D9
--accent-mint: #A8E6CF
```

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Outfit (sans-serif)

### Design Features
- Glassmorphism effects
- Smooth animations (0.3s ease)
- Gradient text and backgrounds
- Floating decorative elements
- Responsive design (mobile-first)

## 📱 Features

### 1. Landing Page
- Hero section with CTA
- Feature cards (clickable)
- How it works section
- Before & after comparison
- Testimonials
- Footer

### 2. Skin Tracking
- AI Skin Scanner (camera interface)
- Manual entry (7 rating sliders)
- Results view with radar chart
- Personalised recommendations
- Cycle-based skincare tips

### 3. Cycle Tracking
- Visual cycle wheel (4 phases)
- Current phase information
- Period date logger
- Phase timeline
- Predictions for next period/ovulation

### 4. Journal & Mood
- Daily mood selector (5 emotions)
- Energy level slider
- Journal textarea with word count
- Quick activity tags
- Past entries display

## 🔄 Development Workflow

### Branch Strategy
```
main (protected)
  ├── feature/feature-name
  ├── fix/bug-name
  ├── docs/doc-update
  └── style/ui-change
```

### Commit Convention
```
type: Brief description

Detailed explanation (optional)

Fixes #issue-number
```

**Types**: feat, fix, docs, style, refactor, test, chore

### Pull Request Process
1. Create feature branch
2. Make changes and commit
3. Push to GitHub
4. Create Pull Request
5. Request review
6. Address feedback
7. Merge when approved

## 👥 Team Setup

### Quick Setup (5 minutes)
```bash
# 1. Clone
git clone https://github.com/puddl3duck/glowcycle.git
cd glowcycle

# 2. Setup virtual environment
# Windows: setup_venv.bat
# macOS/Linux: bash setup_venv.sh

# 3. Open in VS Code
code .

# 4. Install extensions (when prompted)

# 5. Open index.html with Live Server
```

### Virtual Environment

**Create:**
```bash
# Windows
python -m venv .venv
.venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

**Activate:**
```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# Windows CMD
.venv\Scripts\activate.bat

# macOS/Linux
source .venv/bin/activate
```

**Deactivate:**
```bash
deactivate
```

## 📦 Dependencies

### Current (Frontend Only)
- No npm packages
- No Python packages
- Pure HTML/CSS/JS

### Future (When Backend Added)
```bash
pip install -r requirements.txt
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile viewport
- [ ] Check console for errors
- [ ] Verify all links work
- [ ] Test localStorage functionality
- [ ] Validate HTML/CSS

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Current (Static Hosting)
Can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting

### Future (With Backend)
Will require:
- Python hosting (Heroku, Railway, etc.)
- Database hosting
- Environment variables

## 📊 Project Stats

- **Total Files**: 12 HTML/CSS/JS files
- **Documentation**: 6 markdown files (~31KB)
- **Setup Scripts**: 2 files (Windows + macOS/Linux)
- **Lines of Code**: ~3000+ (estimated)
- **Pages**: 4 (landing + 3 internal)

## 🎯 Target Audience

**Primary**: Women aged 18-45+
**Use Cases**:
- Understanding menstrual cycle
- Tracking skin changes
- Getting personalised skincare advice
- Daily journaling and mood tracking
- Connecting with body's natural rhythm

## 🔐 Privacy & Data

- **No sign-up required**
- **No backend (yet)**
- **localStorage only** - All data stored locally
- **No tracking** - Privacy-focused
- **No cookies** - Clean and simple

## 📈 Future Roadmap

### Phase 1 (Current)
- ✅ Landing page
- ✅ Skin tracking
- ✅ Cycle tracking
- ✅ Journal & mood
- ✅ Documentation

### Phase 2 (Next)
- [ ] Python backend
- [ ] User authentication
- [ ] Database integration
- [ ] API endpoints
- [ ] Data synchronization

### Phase 3 (Future)
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Community features
- [ ] Export data
- [ ] Notifications

## 🆘 Support & Resources

### Documentation
- Quick Start: `QUICKSTART.md`
- Full Setup: `SETUP.md`
- Contributing: `CONTRIBUTING.md`
- Onboarding: `TEAM_ONBOARDING.md`

### Links
- Repository: https://github.com/puddl3duck/glowcycle
- Issues: https://github.com/puddl3duck/glowcycle/issues
- Discussions: https://github.com/puddl3duck/glowcycle/discussions

### Learning Resources
- [MDN Web Docs](https://developer.mozilla.org/)
- [Python Docs](https://docs.python.org/3/)
- [Git Documentation](https://git-scm.com/doc)
- [VS Code Tips](https://code.visualstudio.com/docs)

## ✅ Project Status

- **Status**: Active Development
- **Version**: 1.0.0 (Frontend Complete)
- **Last Updated**: February 2026
- **Contributors**: Team
- **License**: All Rights Reserved

## 🎉 Quick Commands Reference

```bash
# Git
git pull origin main              # Get latest
git checkout -b feature/name      # New branch
git add .                         # Stage all
git commit -m "message"           # Commit
git push origin branch-name       # Push

# Python Virtual Environment
.venv\Scripts\Activate.ps1        # Activate (Windows)
source .venv/bin/activate         # Activate (macOS/Linux)
deactivate                        # Deactivate
pip install -r requirements.txt   # Install deps
pip freeze > requirements.txt     # Update deps

# VS Code
code .                            # Open project
Ctrl+Shift+P                      # Command palette
Ctrl+`                            # Toggle terminal
```

---

**Made with 💜 for women who want to glow with their cycle**

**Repository**: https://github.com/puddl3duck/glowcycle
