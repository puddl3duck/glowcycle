# 🌸 Glow Cycle

**Your personalised companion to track your cycle, understand your skin, and connect with your body’s natural rhythm.**

---

## What is Glow Cycle?

A web application that helps women:

- 📅 **Track their menstrual cycle** with smart predictions  
- 💆‍♀️ **Monitor their skin** and receive personalized recommendations  
- 📝 **Keep a journal** of emotions and energy  
- 🤖 **Get AI insights** about how hormones affect their body  

---

## 🚀 Quick Start

### 1. Clone the project
```bash
git clone https://github.com/puddl3duck/glowcycle.git
cd glowcycle
```

### 2. Open the frontend
```bash
cd frontend
# Open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Visit http://localhost:8000
```

### 3. Configure backend (optional)
```bash
cd infrastructure
npm install
npm run build
cdk deploy
```

---

## 🛠 Technologies

**Frontend:** HTML5, CSS3, JavaScript (Vanilla)  
**Backend:** Python, AWS Lambda, DynamoDB  
**IA:** AWS Bedrock (Claude Haiku)  
**Infrastructure:** AWS CDK, TypeScript

---

## 📁 Project Structure

```
glowcycle/
├── frontend/          # Web application (HTML/CSS/JS)
├── backend/           # Lambda functions (Python)
├── infrastructure/    # AWS CDK (TypeScript)
└── tests/             # Tests
```

---

## ✨ Key Features

### 🌙 Cycle Tracking
- Visual calendar with cycle phases
- Next period and ovulation predictions
- Personalised tips for each phase

### 💆‍♀️ Skin Tracking
- Manual skin condition logging
- Correlation with cycle phases
- Skincare recommendations

### 📝 Journal & Mood Tracking
- Daily emotion tracking
- Energy level monitoring
- Pattern identification

### 🤖 AI Wellness Assistant
- Personalised motivational messages
- Hormonal pattern analysis
- Advice based on your current cycle

### 🌓 Dark Mode
- Automatic switching based on time of day
- Manual mode with saved preferences
- Accessible design (WCAG AA/AAA)

---

## 🎯 For Judges

**Evaluation time: 60 seconds**

1. **Problem:** Women don’t fully understand how their hormonal cycle affects their skin and emotions
2. **Solution:** An app that connects menstrual cycle + skin + mood using AI
3. **Innovation:** The first app to use AI to provide personalised insights about hormones and skin
4. **Impact:** Impact: Helps millions of women better understand their bodies

**Live demo:** [glowcycle.app](https://glowcycle.app)

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 👥 Team

Project developed by the Glow Cycle team

---

**Made with 💜 for women who want to understand their bodies**
