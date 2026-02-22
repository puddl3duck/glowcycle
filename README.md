# 🌸 Glow Cycle

**AI-powered menstrual cycle and skin health companion**

## What It Does

Glow Cycle helps women understand the connection between their menstrual cycle and skin health using AI.

### Core Features

1. **🔄 Cycle Tracking** - Track periods and predict phases (menstrual, follicular, ovulation, luteal)
2. **📸 AI Skin Scanner** - Analyze skin condition with facial recognition + AI (AWS Rekognition + Bedrock)
3. **📝 Mood Journal** - Log daily mood, energy, and symptoms
4. **💬 AI Wellness Messages** - Personalized insights connecting cycle phase, skin, and mood (Claude Haiku)

## The Problem We Solve

Women experience hormonal skin changes throughout their cycle but don't know when or why. Glow Cycle connects the dots between hormones, skin, and emotions.

## Tech Stack

**Frontend:** Vanilla JavaScript, HTML5, CSS3  
**Backend:** Python 3.11, AWS Lambda (serverless)  
**AI:** Amazon Bedrock (Claude Haiku & Sonnet)  
**Storage:** DynamoDB, S3  
**Infrastructure:** AWS CDK (TypeScript)

## Architecture

```
Frontend (S3) → API Gateway → Lambda Functions → DynamoDB
                                ↓
                          AWS Bedrock AI
                          AWS Rekognition
```

## Key AI Features

### 1. Skin Analysis
- Detects facial features, skin texture, and concerns
- Provides personalized skincare recommendations
- Tracks skin health over time

### 2. Wellness Messages
- Generates daily personalized messages (max 12 words)
- Analyzes cycle phase + skin + mood data
- Professional, empowering tone without emojis

### 3. Smart Insights
- Connects hormonal phases to skin changes
- Predicts patterns based on historical data
- Adapts recommendations to cycle phase

## Quick Start

### Prerequisites
- AWS Account with Bedrock access
- Node.js 18+ and Python 3.11+
- AWS CDK CLI

### Deploy

```bash
# 1. Install dependencies
cd infrastructure
npm install

# 2. Deploy to AWS
cdk deploy

# 3. Update frontend config
# Copy API endpoint from deployment output to frontend/js/config.js

# 4. Upload frontend to S3 or hosting service
```

### Local Development

```bash
# Frontend: Open frontend/index.html in browser
# Backend: Deploy to AWS (Lambda functions require AWS environment)
```

## Project Structure

```
glowcycle/
├── frontend/           # Web application
│   ├── css/           # Styles (including dark mode)
│   ├── js/            # JavaScript modules
│   └── pages/         # Feature pages
├── backend/           # Lambda functions
│   ├── journal/       # Mood tracking
│   ├── period/        # Cycle tracking
│   ├── skin/          # AI skin analysis
│   ├── wellness/      # AI wellness messages
│   └── utils/         # Shared utilities
└── infrastructure/    # AWS CDK deployment
```

## Demo Flow

1. **Onboarding** - User enters name, age, skin type, last period
2. **Dashboard** - Shows personalized wellness message + cycle phase
3. **Skin Scan** - Take selfie → AI analyzes → Get report + recommendations
4. **Journal** - Log mood/energy → AI generates insights
5. **Cycle Calendar** - Visual tracking with predictions

## Innovation Highlights

✨ **Holistic Approach** - First app to connect cycle + skin + mood with AI  
🎯 **Personalized AI** - Messages adapt to individual patterns  
📊 **Visual Insights** - Beautiful charts showing skin-cycle correlation  
🌙 **Dark Mode** - Automatic theme based on time of day  
💜 **Empowering** - Professional tone, educational focus

## AWS Services Used

- **Lambda** - Serverless compute
- **Bedrock** - AI/ML (Claude models)
- **Rekognition** - Facial analysis
- **DynamoDB** - NoSQL database
- **S3** - Storage for images
- **API Gateway** - REST API
- **CloudFormation** - Infrastructure as code

## Cost Optimization

- Claude Haiku for frequent operations (~$0.00006/message)
- Smart caching to minimize API calls
- Serverless architecture (pay per use)
- Estimated: ~$0.07/user/year

## Future Enhancements

- Product recommendations integration
- Cycle-skin correlation analytics
- Export reports as PDF
- Multi-language support
- Mobile app (React Native)

---

**Built with 💜 for AWS Hackathon**  
*Empowering women through AI-driven health insights*
