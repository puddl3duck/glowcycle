# 🐍 Glow Cycle Backend

Python backend for Glow Cycle, built with AWS Lambda and serverless architecture.

## 📁 Structure

```
backend/
├── journal/          # Journal & mood tracking
│   └── handler.py    # Lambda handler for journal operations
├── period/           # Cycle tracking
│   └── handler.py    # Lambda handler for period operations
├── skin/             # Skin tracking
│   └── handler.py    # Lambda handler for skin operations
├── utils/            # Shared utilities
│   ├── bedrock_client.py   # AWS Bedrock client
│   ├── dynamo_client.py  # DynamoDB client
│   └── s3_client.py        # S3 client
└── requirements.txt  # Python dependencies
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- pip
- Virtual environment (recommended)

### Setup

1. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # macOS/Linux
   .venv\Scripts\activate     # Windows
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure AWS credentials**
   ```bash
   aws configure
   ```

## 📦 Dependencies

### Core
- `boto3` - AWS SDK for Python
- `python-dotenv` - Environment variable management

### Development
- `pytest` - Testing framework
- `pytest-cov` - Coverage reporting
- `flake8` - Linting
- `black` - Code formatting
- `mypy` - Type checking

## 🧪 Testing

### Run Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html

# Run specific test file
pytest tests/test_journal.py

# Run with verbose output
pytest -v
```

### Test Structure
```
tests/
├── test_journal.py
├── test_period.py
├── test_skin.py
└── test_utils.py
```

## 🔧 Development

### Code Style
We follow PEP 8 with Black formatting:

```bash
# Format code
black backend/

# Check linting
flake8 backend/

# Type checking
mypy backend/
```

### Environment Variables
Create a `.env` file in the backend directory:

```env
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=glow-cycle-data
S3_BUCKET_NAME=glow-cycle-assets
BEDROCK_MODEL_ID=anthropic.claude-v2
```

## 📡 API Endpoints

### Journal Operations
- `POST /journal` - Create journal entry
- `GET /journal/{id}` - Get journal entry
- `GET /journal/user/{userId}` - Get user's journal entries
- `PUT /journal/{id}` - Update journal entry
- `DELETE /journal/{id}` - Delete journal entry

### Period Operations
- `POST /period` - Log period date
- `GET /period/user/{userId}` - Get user's period history
- `GET /period/predictions/{userId}` - Get cycle predictions

### Skin Operations
- `POST /skin` - Log skin condition
- `GET /skin/user/{userId}` - Get user's skin history
- `POST /skin/analyze` - Analyze skin (AI-powered)

## 🏗 Architecture

### Lambda Handlers
Each handler follows this structure:

```python
def lambda_handler(event, context):
    """
    AWS Lambda handler function.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    try:
        # Parse request
        body = json.loads(event['body'])
        
        # Process request
        result = process_request(body)
        
        # Return response
        return {
            'statusCode': 200,
            'body': json.dumps(result),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
```

### Database Schema

#### Journal Table
```python
{
    'userId': 'string',      # Partition key
    'entryId': 'string',     # Sort key
    'date': 'string',        # ISO 8601 format
    'mood': 'string',        # Mood emoji/type
    'energy': 'number',      # 0-100
    'text': 'string',        # Journal entry
    'tags': ['string'],      # Tags array
    'cycleDay': 'number'     # Day in cycle
}
```

#### Period Table
```python
{
    'userId': 'string',      # Partition key
    'date': 'string',        # Sort key (ISO 8601)
    'cycleLength': 'number', # Days
    'flow': 'string',        # light/medium/heavy
    'symptoms': ['string']   # Symptoms array
}
```

#### Skin Table
```python
{
    'userId': 'string',      # Partition key
    'scanId': 'string',      # Sort key
    'date': 'string',        # ISO 8601 format
    'metrics': {
        'radiance': 'number',
        'moisture': 'number',
        'texture': 'number',
        'pores': 'number',
        'darkCircles': 'number'
    },
    'cycleDay': 'number'     # Day in cycle
}
```

## 🚀 Deployment

### Deploy with CDK
```bash
cd ../infrastructure
npm run cdk deploy
```

### Manual Deployment
```bash
# Package Lambda function
zip -r function.zip backend/

# Upload to S3
aws s3 cp function.zip s3://your-bucket/

# Update Lambda function
aws lambda update-function-code \
  --function-name glow-cycle-journal \
  --s3-bucket your-bucket \
  --s3-key function.zip
```

## 📊 Monitoring

### CloudWatch Logs
```bash
# View logs
aws logs tail /aws/lambda/glow-cycle-journal --follow

# Filter errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/glow-cycle-journal \
  --filter-pattern "ERROR"
```

### Metrics
- Invocation count
- Error rate
- Duration
- Throttles

## 🔒 Security

### Best Practices
- Use IAM roles with least privilege
- Encrypt data at rest (DynamoDB encryption)
- Encrypt data in transit (HTTPS)
- Validate all inputs
- Sanitize user data
- Use environment variables for secrets
- Enable CloudTrail logging

### Secrets Management
Use AWS Secrets Manager or Parameter Store:

```python
import boto3

def get_secret(secret_name):
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return response['SecretString']
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: Lambda timeout
- **Solution**: Increase timeout in CDK stack or optimize code

**Issue**: DynamoDB throttling
- **Solution**: Increase provisioned capacity or use on-demand billing

**Issue**: Import errors
- **Solution**: Ensure all dependencies are in requirements.txt and deployed

## 📚 Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

---

**Last Updated**: 2026-02-14  
**Version**: 2.0
