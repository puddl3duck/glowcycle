# 🌸 Glow Cycle

Your AI-powered companion to understand how your hormones affect your skin, mood, and body.

## What is Glow Cycle?

An intelligent web app that uses AI to analyse the connection between your menstrual cycle, skin condition, and emotional wellbeing - giving you personalised insights no other app provides.

## 🎯 For Judges - Quick Evaluation Guide

### 🔗 Essential Links

**Live Demo:** [https://glowcycle-lemon.vercel.app/](https://glowcycle-lemon.vercel.app/)

**Video Demo (3 min):** [https://youtu.be/BysnDCeSQGo](https://youtu.be/BysnDCeSQGo)

**GitHub Repository:** [https://github.com/puddl3duck/glowcycle](https://github.com/puddl3duck/glowcycle)

### 👤 Judge Test Accounts

Pre-configured accounts ready for immediate testing:

| Name | Username | Password |
| --- | --- | --- |
| Rada Stanic | `Rada Stanic` | `glowcycle2026` |
| Luke Anderson | `Luke Anderson` | `glowcycle2026` |
| Sarah Basset | `Sarah Basset` | `glowcycle2026` |
| Team | `Team` | `glowcycle2026` |

**Testing Note:** Judge accounts skip the name question and go directly to setup. All data persists in DynamoDB, so it works in incognito mode.

### 📊 60-Second Overview

**The Problem:** Women struggle to understand how their hormonal cycle affects their skin and emotions. Existing apps are siloed - period trackers don't connect to skincare, mood journals don't link to hormonal phases.

**Our Solution:** GlowCycle is the first AI-powered app that connects menstrual cycle data with skin condition analysis and mood patterns to provide personalised hormonal insights.

**Key Innovation:** 
- Real-time AI skin analysis using AWS Bedrock (Claude Haiku) and Rekognition
- Correlates skin condition with cycle phase for personalised recommendations
- Unified wellness dashboard connecting cycle, mood, and skin data

**Impact:** Empowers women to understand their body's natural rhythm, make informed skincare decisions, and anticipate hormonal changes.

**Tech Stack:** 
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: AWS Lambda (Python 3.11), API Gateway
- Data: DynamoDB, S3
- AI: AWS Bedrock (Claude Haiku), Amazon Rekognition
- Infrastructure: AWS CDK (TypeScript)

### 🧪 Recommended Testing Flow

1. **Login** with any judge account above
2. **Complete Setup** - answer 3-4 quick questions about cycle and preferences
3. **Track Period** - add a period start date to see cycle predictions
4. **Scan Skin** - upload a selfie to get AI-powered skin analysis
5. **Log Mood** - add a journal entry with mood and energy levels
6. **Get AI Insights** - visit Wellness Agent for personalised guidance
7. **Explore Dark Mode** - toggle theme to see accessibility features

### 🏆 Hackathon Alignment

**AWS Services Used:**
- AWS Bedrock for AI-powered insights and skin analysis
- AWS Lambda for serverless backend
- Amazon DynamoDB for data persistence
- Amazon S3 for image storage
- Amazon Rekognition for face detection
- AWS CDK for infrastructure as code

**Diversity & Inclusion Impact:**
- Addresses women's health - an underserved area in tech
- Provides accessible, personalised wellness guidance
- Empowers users with knowledge about their bodies

### 🏗️ Architecture

![Architecture Diagram](Architecture%20diagram.png)

Our serverless architecture leverages AWS services for scalability and reliability, with AI-powered analysis at its core.

## ✨ Core Features

**AI Skin Scanner** - Take a selfie, get instant AI analysis of your skin condition with personalised recommendations based on your cycle phase

**Smart Cycle Tracking** - Visual calendar with predictions and phase-specific tips

**Mood Journal** - Track emotions and energy to identify hormonal patterns

**AI Wellness Assistant** - Personalised insights connecting your skin, cycle, and mood data

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

All rights reserved.

---

Made with 💜 for women who want to understand their body
