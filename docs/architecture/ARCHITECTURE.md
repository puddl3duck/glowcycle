# 🏗 Glow Cycle Architecture

## Overview

Glow Cycle is a serverless web application built on AWS, designed to help users track their menstrual cycle, skin condition, and mood patterns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                    (Frontend - HTML/CSS/JS)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CloudFront CDN                              │
│                   (Content Delivery)                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         S3 Bucket                                │
│                   (Static Website Hosting)                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                                 │
│                    (REST API Endpoint)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Lambda Functions                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Journal    │  │    Period    │  │     Skin     │         │
│  │   Handler    │  │   Handler    │  │   Handler    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DynamoDB                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Journal    │  │    Period    │  │     Skin     │         │
│  │    Table     │  │    Table     │  │    Table     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AWS Bedrock                                 │
│                  (AI/ML - Claude Model)                          │
│                  (Skin Analysis - Future)                        │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### Frontend Layer

#### Technology Stack
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties
- **JavaScript (ES6+)**: Vanilla JS for interactivity
- **No Framework**: Lightweight and fast

#### Features
- Responsive design
- Dark mode support
- Time-based personalization
- Local storage for preferences
- Progressive enhancement

#### File Structure
```
frontend/
├── css/
│   ├── styles.css              # Main dashboard styles
│   ├── cycle-tracking.css      # Cycle tracking page
│   ├── journal-mood.css        # Journal & mood page
│   ├── skin-tracking.css       # Skin tracking page
│   └── dark-mode-complete.css  # Dark mode styles
├── js/
│   ├── script.js               # Main dashboard logic
│   ├── cycle-tracking.js       # Cycle tracking logic
│   ├── journal-mood.js         # Journal & mood logic
│   └── skin-tracking.js        # Skin tracking logic
├── pages/
│   ├── cycle-tracking.html     # Cycle tracking page
│   ├── journal-mood.html       # Journal & mood page
│   └── skin-tracking.html      # Skin tracking page
└── index.html                  # Main dashboard
```

### Backend Layer

#### Technology Stack
- **Python 3.9+**: Core language
- **AWS Lambda**: Serverless compute
- **Boto3**: AWS SDK for Python

#### Lambda Functions

##### Journal Handler
- **Purpose**: Manage journal entries and mood tracking
- **Operations**: Create, Read, Update, Delete (CRUD)
- **Database**: DynamoDB journal table

##### Period Handler
- **Purpose**: Track menstrual cycle data
- **Operations**: Log periods, calculate predictions
- **Database**: DynamoDB period table

##### Skin Handler
- **Purpose**: Track skin condition
- **Operations**: Log skin data, analyze patterns
- **Database**: DynamoDB skin table
- **AI**: AWS Bedrock integration (future)

#### File Structure
```
backend/
├── journal/
│   └── handler.py              # Journal Lambda handler
├── period/
│   └── handler.py              # Period Lambda handler
├── skin/
│   └── handler.py              # Skin Lambda handler
└── utils/
    ├── bedrock_client.py       # AWS Bedrock client
    ├── dynamodb_client.py      # DynamoDB client
    └── s3_client.py            # S3 client
```

### Data Layer

#### DynamoDB Tables

##### Journal Table
```
Partition Key: userId (String)
Sort Key: entryId (String)
Attributes:
  - date: ISO 8601 timestamp
  - mood: String (emoji/type)
  - energy: Number (0-100)
  - text: String (journal entry)
  - tags: List of Strings
  - cycleDay: Number
```

##### Period Table
```
Partition Key: userId (String)
Sort Key: date (String - ISO 8601)
Attributes:
  - cycleLength: Number (days)
  - flow: String (light/medium/heavy)
  - symptoms: List of Strings
```

##### Skin Table
```
Partition Key: userId (String)
Sort Key: scanId (String)
Attributes:
  - date: ISO 8601 timestamp
  - metrics: Map
    - radiance: Number
    - moisture: Number
    - texture: Number
    - pores: Number
    - darkCircles: Number
  - cycleDay: Number
```

### Infrastructure Layer

#### AWS CDK Stack
- **Language**: TypeScript
- **Framework**: AWS CDK v2
- **Deployment**: CloudFormation

#### Resources
- Lambda Functions (3)
- DynamoDB Tables (3)
- S3 Buckets (2)
- API Gateway (1)
- CloudFront Distribution (1)
- IAM Roles and Policies

## Data Flow

### User Journey: Create Journal Entry

```
1. User fills journal form
   ↓
2. JavaScript validates input
   ↓
3. POST request to API Gateway
   ↓
4. API Gateway invokes Lambda
   ↓
5. Lambda validates data
   ↓
6. Lambda writes to DynamoDB
   ↓
7. DynamoDB returns success
   ↓
8. Lambda returns response
   ↓
9. API Gateway returns to frontend
   ↓
10. JavaScript updates UI
```

### User Journey: View Cycle Predictions

```
1. User opens cycle tracking page
   ↓
2. JavaScript requests data
   ↓
3. GET request to API Gateway
   ↓
4. API Gateway invokes Lambda
   ↓
5. Lambda queries DynamoDB
   ↓
6. Lambda calculates predictions
   ↓
7. Lambda returns data
   ↓
8. API Gateway returns to frontend
   ↓
9. JavaScript renders cycle wheel
```

## Security

### Authentication & Authorization
- **Current**: API Key authentication
- **Future**: AWS Cognito user pools

### Data Protection
- **In Transit**: HTTPS/TLS 1.2+
- **At Rest**: DynamoDB encryption (AWS managed)
- **S3**: Server-side encryption (SSE-S3)

### IAM Policies
- Least privilege principle
- Separate roles for each Lambda
- No hardcoded credentials

### CORS
- Configured on API Gateway
- Whitelist specific origins (production)

## Performance

### Frontend Optimization
- Minified CSS/JS (future)
- Image optimization
- Lazy loading
- Browser caching
- CDN distribution

### Backend Optimization
- Lambda cold start mitigation
- DynamoDB on-demand billing
- Efficient queries with indexes
- Connection pooling

### Caching Strategy
- CloudFront edge caching
- Browser caching headers
- API response caching (future)

## Scalability

### Horizontal Scaling
- Lambda: Auto-scales to demand
- DynamoDB: On-demand capacity
- S3: Unlimited storage
- CloudFront: Global distribution

### Vertical Scaling
- Lambda memory configuration
- DynamoDB provisioned capacity (if needed)

## Monitoring & Logging

### CloudWatch
- Lambda execution logs
- API Gateway access logs
- Custom metrics
- Alarms for errors

### X-Ray (Future)
- Distributed tracing
- Performance analysis
- Bottleneck identification

## Disaster Recovery

### Backup Strategy
- DynamoDB: Point-in-time recovery
- S3: Versioning enabled
- Infrastructure: CDK code in Git

### Recovery Objectives
- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 5 minutes

## Cost Optimization

### Current Costs (Estimated)
- Lambda: ~$0.20 per 1M requests
- DynamoDB: ~$1.25 per 1M writes
- S3: ~$0.023 per GB
- API Gateway: ~$3.50 per 1M requests
- **Total**: ~$10-50/month for 10K users

### Optimization Strategies
- On-demand billing for DynamoDB
- S3 lifecycle policies
- Lambda memory optimization
- CloudWatch Logs retention

## Future Enhancements

### Phase 1 (v1.1)
- AI-powered skin analysis with Bedrock
- Advanced analytics dashboard
- Data export functionality
- Email notifications

### Phase 2 (v2.0)
- User authentication with Cognito
- Social features (community)
- Healthcare provider integration
- Mobile app (React Native)

### Phase 3 (v3.0)
- Wearable device integration
- Multi-language support
- Premium features
- Marketplace for products

## Technology Decisions

### Why Serverless?
- **Cost**: Pay only for what you use
- **Scalability**: Auto-scales to demand
- **Maintenance**: No server management
- **Speed**: Fast deployment and iteration

### Why DynamoDB?
- **Performance**: Single-digit millisecond latency
- **Scalability**: Handles any scale
- **Flexibility**: NoSQL schema
- **Integration**: Native AWS integration

### Why Vanilla JavaScript?
- **Performance**: No framework overhead
- **Simplicity**: Easy to understand
- **Size**: Smaller bundle size
- **Control**: Full control over code

## Compliance & Privacy

### Data Privacy
- GDPR compliant (future)
- HIPAA considerations (future)
- User data ownership
- Right to deletion

### Security Standards
- OWASP Top 10 mitigation
- Regular security audits
- Dependency scanning
- Penetration testing (future)

---

**Last Updated**: 2026-02-14  
**Version**: 2.0  
**Author**: Glow Cycle Team
