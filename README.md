# 🌸 Glow Cycle

> Your personalised companion for tracking your cycle, understanding your skin, and connecting with your body's natural rhythm.

[![CI/CD](https://github.com/puddl3duck/glowcycle/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/puddl3duck/glowcycle/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/guides/CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-purple.svg)](CODE_OF_CONDUCT.md)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🌙 **Cycle Tracking**
- Visual cycle wheel with phase indicators
- Personalised predictions for next period and ovulation
- Phase-specific tips and recommendations
- Historical tracking and insights

### 💆‍♀️ **Skin Tracking**
- AI-powered skin analysis (coming soon)
- Manual skin condition logging
- Cycle-phase correlated skin insights
- Personalised skincare routine recommendations

### 📝 **Journal & Mood**
- Daily mood tracking with emoji interface
- Energy level monitoring
- Thought journaling with word count
- Customisable tags for patterns
- Historical entry viewing

### 🎨 **Time-Based Personalisation**
- **Morning (5:00-11:59)**: Energising content, AM skincare routine
- **Afternoon (12:00-17:59)**: Balanced suggestions, light refresh routine
- **Night (18:00-4:59)**: Calming content, PM skincare routine
- Auto theme switching (light/dark)
- Manual theme override with persistence

### 🌓 **Dark Mode**
- Complete dark mode implementation (100% coverage)
- WCAG AA/AAA compliant contrast ratios
- Natural icon brightness (0.95x)
- Smooth transitions (300ms)
- Accessible focus states

---

## 🎥 Demo

### Live Demo
🔗 [https://glowcycle.app](https://glowcycle.app) *(coming soon)*

### Screenshots

<table>
  <tr>
    <td><img src="docs/screenshots/landing.png" alt="Landing Page" width="300"/></td>
    <td><img src="docs/screenshots/dashboard.png" alt="Dashboard" width="300"/></td>
    <td><img src="docs/screenshots/cycle.png" alt="Cycle Tracking" width="300"/></td>
  </tr>
  <tr>
    <td align="center">Landing Page</td>
    <td align="center">Dashboard</td>
    <td align="center">Cycle Tracking</td>
  </tr>
</table>

---

## 🛠 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Vanilla JS for interactivity
- **Fonts**: Google Fonts (Outfit, Playfair Display)

### Backend
- **Python 3.9+** - Core backend logic
- **AWS Lambda** - Serverless functions
- **DynamoDB** - NoSQL database
- **S3** - Static asset storage
- **Bedrock** - AI/ML capabilities (coming soon)

### Infrastructure
- **AWS CDK** - Infrastructure as Code
- **TypeScript** - CDK stack definitions
- **CloudFormation** - AWS resource provisioning

### DevOps
- **GitHub Actions** - CI/CD pipeline
- **Git** - Version control
- **npm** - Package management

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **AWS CLI** (for deployment) ([Install](https://aws.amazon.com/cli/))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/puddl3duck/glowcycle.git
   cd glowcycle
   ```

2. **Setup Python environment**
   ```bash
   # Windows
   .\scripts\setup_venv.bat
   
   # macOS/Linux
   chmod +x scripts/setup_venv.sh
   ./scripts/setup_venv.sh
   ```

3. **Verify setup**
   ```bash
   python scripts/verify_venv.py
   ```

4. **Open the frontend**
   ```bash
   # Open frontend/index.html in your browser
   # Or use a local server:
   cd frontend
   python -m http.server 8000
   # Visit http://localhost:8000
   ```

5. **Setup infrastructure** (optional)
   ```bash
   cd infrastructure
   npm install
   npm run build
   ```

For detailed setup instructions, see [Setup Guide](docs/guides/SETUP.md).

---

## 📁 Project Structure

```
glowcycle/
├── .github/              # GitHub configuration
│   └── workflows/        # CI/CD workflows
├── backend/              # Python backend
│   ├── journal/          # Journal & mood handlers
│   ├── period/           # Cycle tracking handlers
│   ├── skin/             # Skin tracking handlers
│   ├── utils/            # Shared utilities
│   └── requirements.txt  # Python dependencies
├── docs/                 # Documentation
│   ├── architecture/     # Architecture docs
│   ├── api/              # API documentation
│   ├── dark-mode/        # Dark mode docs
│   └── guides/           # User guides
├── frontend/             # Frontend application
│   ├── css/              # Stylesheets
│   ├── images/           # Images and assets
│   ├── js/               # JavaScript files
│   ├── pages/            # HTML pages
│   └── index.html        # Main dashboard
├── infrastructure/       # AWS CDK infrastructure
│   ├── glow_cycle.ts     # CDK app entry
│   ├── glow_cycle_stack.ts # Stack definition
│   └── package.json      # Node dependencies
├── scripts/              # Utility scripts
│   ├── setup_venv.bat    # Windows setup
│   ├── setup_venv.sh     # Unix setup
│   └── verify_venv.py    # Verification script
├── tests/                # Test files
│   ├── backend/          # Backend tests
│   └── frontend/         # Frontend tests
├── .editorconfig         # Editor configuration
├── .gitignore            # Git ignore rules
├── CODE_OF_CONDUCT.md    # Code of conduct
├── LICENSE               # License file
├── README.md             # This file
└── requirements.txt      # Root Python dependencies
```

---

## 💻 Development

### Frontend Development

```bash
cd frontend

# Open in browser
open index.html

# Or use a local server
python -m http.server 8000
```

### Backend Development

```bash
# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Run tests
pytest backend/
```

### Infrastructure Development

```bash
cd infrastructure

# Install dependencies
npm install

# Build TypeScript
npm run build

# Synthesize CloudFormation
npm run cdk synth

# Deploy to AWS
npm run cdk deploy
```

### Code Style

We follow these style guides:
- **Python**: [PEP 8](https://pep8.org/) with [Black](https://black.readthedocs.io/)
- **JavaScript**: [Airbnb Style Guide](https://github.com/airbnb/javascript)
- **TypeScript**: [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

---

## 🧪 Testing

### Run All Tests

```bash
# Backend tests
pytest backend/ --cov=backend

# Frontend tests (if configured)
cd frontend
npm test

# Infrastructure tests
cd infrastructure
npm test
```

### Test Coverage

We aim for >80% code coverage. View coverage reports:

```bash
# Backend coverage
pytest backend/ --cov=backend --cov-report=html
open htmlcov/index.html
```

---

## 🚢 Deployment

### Deploy to AWS

```bash
# Configure AWS credentials
aws configure

# Deploy infrastructure
cd infrastructure
npm run cdk deploy

# Deploy frontend to S3
aws s3 sync frontend/ s3://your-bucket-name/ --delete
```

### Environment Variables

Create a `.env` file (not committed to git):

```env
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
DYNAMODB_TABLE_NAME=glow-cycle-data
S3_BUCKET_NAME=glow-cycle-assets
```

For detailed deployment instructions, see [Deployment Guide](docs/guides/DEPLOYMENT.md).

---

## 📚 Documentation

### User Guides
- [Quick Start](docs/guides/QUICKSTART.md)
- [Setup Guide](docs/guides/SETUP.md)
- [Team Onboarding](docs/guides/TEAM_ONBOARDING.md)

### Technical Documentation
- [Architecture Overview](docs/architecture/PROJECT_SUMMARY.md)
- [API Documentation](docs/api/README.md)
- [Dark Mode Guide](docs/dark-mode/DARK_MODE_INDEX.md)

### Development Guides
- [Contributing Guide](docs/guides/CONTRIBUTING.md)
- [Commit Guide](docs/guides/COMMIT_GUIDE.md)
- [Testing Guide](docs/dark-mode/DARK_MODE_TESTING.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/guides/CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Project Lead**: [Your Name](https://github.com/puddl3duck)
- **Contributors**: [Contributors](https://github.com/puddl3duck/glowcycle/graphs/contributors)

---

## 🙏 Acknowledgments

- Design inspiration from modern wellness apps
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Community feedback and support

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/puddl3duck/glowcycle/issues)
- **Discussions**: [GitHub Discussions](https://github.com/puddl3duck/glowcycle/discussions)
- **Email**: support@glowcycle.app

---

## 🗺 Roadmap

### v1.0 (Current)
- ✅ Cycle tracking
- ✅ Journal & mood tracking
- ✅ Skin tracking (manual)
- ✅ Dark mode
- ✅ Time-based personalisation

### v1.1 (Next)
- 🔄 AI-powered skin analysis
- 🔄 Advanced analytics
- 🔄 Export data feature
- 🔄 Mobile app

### v2.0 (Future)
- 📋 Community features
- 📋 Healthcare provider integration
- 📋 Wearable device sync
- 📋 Multi-language support

---

<div align="center">

**Made with 💜 by the Glow Cycle Team**

[Website](https://glowcycle.app) • [Documentation](docs/) • [Report Bug](https://github.com/puddl3duck/glowcycle/issues) • [Request Feature](https://github.com/puddl3duck/glowcycle/issues)

</div>
