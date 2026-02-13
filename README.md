# 🌸 Glow Cycle

A premium wellness web application designed to help women understand their skin through their menstrual cycle. Track your cycle phases, monitor skin conditions, and journal your daily mood and energy levels.

## ✨ Features

- **Cycle Tracking**: Visual cycle wheel showing all 4 phases with personalized tips
- **Skin Tracking**: AI scanner or manual entry to monitor skin condition daily
- **Journal & Mood**: Daily journaling with mood tracking and energy levels
- **Personalized Insights**: Get skincare recommendations based on your cycle phase
- **Beautiful UI**: Premium wellness aesthetic with pastel colors and smooth animations

## 📁 Project Structure

```
glowcycle/
├── index.html              # Main landing page
├── README.md              # Project documentation
│
├── css/                   # Stylesheets
│   ├── styles.css         # Main landing page styles
│   ├── skin-tracking.css  # Skin tracking page styles
│   ├── cycle-tracking.css # Cycle tracking page styles
│   └── journal-mood.css   # Journal & mood page styles
│
├── js/                    # JavaScript files
│   ├── script.js          # Main landing page functionality
│   ├── skin-tracking.js   # Skin tracking functionality
│   ├── cycle-tracking.js  # Cycle tracking functionality
│   └── journal-mood.js    # Journal & mood functionality
│
├── images/                # Image assets
│   ├── hero-illustration.png
│   ├── decoration-sparkle.png
│   └── decoration-heart.png
│
└── pages/                 # Internal pages
    ├── skin-tracking.html
    ├── cycle-tracking.html
    └── journal-mood.html
```

## 🎨 Design System

### Colors
- **Cream Background**: `#FAF8F5`
- **Lavender**: `#D4C5E8`, `#E8E4F3`
- **Pink**: `#FFD4E5`, `#FFE8F0`
- **Mint**: `#A8E6CF`, `#E3F4F4`
- **Accent Coral**: `#FF9B9B`
- **Accent Purple**: `#9B7EBD`

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Outfit (sans-serif)

### Design Features
- Glassmorphism effects
- Smooth animations and transitions
- Gradient text and backgrounds
- Floating decorative elements
- Responsive design

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd glowcycle
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - No build process required - pure HTML, CSS, and JavaScript

3. **Development**
   - Use any code editor (VS Code recommended)
   - Use Live Server extension for hot reload during development

## 📱 Pages Overview

### Landing Page (`index.html`)
- Hero section with call-to-action
- Feature cards (clickable to navigate)
- How it works section
- Before & after comparison
- Testimonials
- Footer

### Skin Tracking (`pages/skin-tracking.html`)
- AI Skin Scanner option
- Manual entry with 7 rating sliders
- Results view with radar chart
- Personalized recommendations

### Cycle Tracking (`pages/cycle-tracking.html`)
- Visual cycle wheel (4 phases)
- Current phase information
- Period date logger
- Phase timeline
- Predictions for next period/ovulation

### Journal & Mood (`pages/journal-mood.html`)
- Daily mood selector (5 emotions)
- Energy level slider
- Journal textarea
- Quick activity tags
- Past entries display

## 💾 Data Storage

- Uses `localStorage` for client-side data persistence
- No backend required
- Data stored locally in browser:
  - Last period date
  - Journal entries
  - Mood and energy logs

## 🎯 Target Audience

Women aged 18-45+ who want to:
- Understand their menstrual cycle
- Track skin changes throughout their cycle
- Get personalized skincare advice
- Journal daily thoughts and emotions
- Connect with their body's natural rhythm

## 🌟 Key Principles

- **Empowering**: Not instructive, supportive
- **Community-driven**: Made by women, for women
- **Premium wellness**: High-quality aesthetic
- **Privacy-focused**: No sign-up required, local storage only
- **Accessible**: Simple, intuitive navigation

## 🔧 Technologies Used

- HTML5
- CSS3 (with custom properties)
- Vanilla JavaScript
- Google Fonts (Playfair Display, Outfit)
- SVG for icons and illustrations

## 📝 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

All rights reserved.

---

**Made with 💜 for women who want to glow with their cycle**
