# 🌸 Glow Cycle

Your AI-powered companion to understand how your hormones affect your skin, mood, and body.

## What is Glow Cycle?

An intelligent web app that uses AI to analyse the connection between your menstrual cycle, skin condition, and emotional wellbeing - giving you personalized insights no other app provides.

## 🎯 For Judges (60-second overview)

**The Problem:** Women struggle to understand how their hormonal cycle affects their skin and emotions.

**Our Solution:** AI-powered skin analysis that connects menstrual cycle data with skin condition and mood patterns.

**Key Innovation:** First app combining AWS Bedrock AI with real-time skin analysis to provide personalized hormonal insights.

**Impact:** Empowers women to understand their body's natural rhythm and make informed skincare decisions.

**Tech Stack:** AWS (Lambda, DynamoDB, Bedrock), Python, JavaScript, TypeScript CDK

**Live Demo:** glowcycle.app

### Judge Access Credentials

Pre-configured accounts for judges to test the application:

| Name | Username | Password |
|------|----------|----------|
| Rada Stanic | `Rada Stanic` | `glowcycle2026` |
| Luke Anderson | `Luke Anderson` | `glowcycle2026` |
| Sarah Basset | `Sarah Basset` | `glowcycle2026` |
| Team | `Team` | `glowcycle2026` |

**Note:** Judge accounts skip the name question in the onboarding questionnaire and proceed directly to the setup questions. Setup completion is persisted in the backend (DynamoDB), so it works even in incognito mode.

## ✨ Core Features

**AI Skin Scanner** - Take a selfie, get instant AI analysis of your skin condition with personalized recommendations based on your cycle phase

**Smart Cycle Tracking** - Visual calendar with predictions and phase-specific tips

**Mood Journal** - Track emotions and energy to identify hormonal patterns

**AI Wellness Assistant** - Personalized insights connecting your skin, cycle, and mood data

**Dark Mode** - Automatic theme switching with full accessibility support

## 🚀 Quick Start

```bash
# Clone and run
git clone https://github.com/puddl3duck/glowcycle.git
cd glowcycle/frontend
python -m http.server 8000
# Visit http://localhost:8000
```

## 🛠 Technologies

Frontend: HTML5, CSS3, Vanilla JavaScript  
Backend: Python, AWS Lambda, DynamoDB  
AI: AWS Bedrock (Claude Haiku)  
Infrastructure: AWS CDK, TypeScript

## 📁 Structure

```
glowcycle/
├── frontend/       # Web application
├── backend/        # Lambda functions
└── infrastructure/ # AWS CDK deployment
```

## 📄 License

MIT License

---

Made with 💜 for women who want to understand their body
