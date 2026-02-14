# 🌸 Glow Cycle - Frontend

This folder contains all the frontend files for the Glow Cycle application.

## 🚀 How to Run

1. **Open in VS Code**
   ```bash
   code .
   ```

2. **Install Live Server Extension**
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server"
   - Install it

3. **Start the Application**
   - Right-click on `frontend/index.html`
   - Select "Open with Live Server"
   - Your browser will open at `http://localhost:5500`

## 📁 Structure

```
frontend/
├── index.html              # Main landing page
├── css/                    # All stylesheets
├── js/                     # All JavaScript files
├── images/                 # Image assets
└── pages/                  # Internal pages
    ├── skin-tracking.html
    ├── cycle-tracking.html
    └── journal-mood.html
```

## 🎨 Features

- **Dashboard**: Main view with motivational hero and tracking cards
- **About**: Educational content (How It Works, testimonials)
- **Skin Tracking**: AI scanner with consent popup
- **Cycle Tracking**: Visual cycle wheel
- **Journal & Mood**: Daily journaling

## 🔗 Navigation

All internal links use relative paths:
- From `index.html` to pages: `pages/skin-tracking.html`
- From pages back to index: `../index.html`
- CSS/JS from pages: `../css/styles.css`, `../js/script.js`

## 💡 Tips

- Always start Live Server from `frontend/index.html`
- All paths are relative, so the structure must remain intact
- Images are in `images/` folder
- Each page has its own CSS and JS file

---

**Made with 💜 for women who want to glow with their cycle**
