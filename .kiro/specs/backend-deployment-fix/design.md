# Backend Deployment Fix - Design Document

## Overview
This design outlines the deployment strategy to fix the Decimal serialization error affecting the Glow Cycle backend Lambda functions.

## Architecture

### Current State
- Local code: ✅ Has DecimalEncoder fix
- AWS Lambda: ❌ Running old code without fix
- Result: 500 errors when DynamoDB returns Decimal values

### Target State
- AWS Lambda functions updated with DecimalEncoder
- All API responses properly serialize Decimal to int/float
- Zero serialization errors

## Implementation Strategy

### Option 1: AWS CDK Deployment (Recommended)
**Pros:**
- Infrastructure as Code
- Automated deployment
- Version controlled
- Repeatable process

**Cons:**
- Requires Node.js and CDK setup
- Initial setup time if not configured

**Steps:**
1. Navigate to infrastructure directory
2. Install dependencies: `npm install`
3. Build TypeScript: `npm run build`
4. Deploy: `cdk deploy`

### Option 2: AWS Console Manual Upload
**Pros:**
- Quick for small changes
- No local tooling required
- Visual confirmation

**Cons:**
- Manual process
- Error-prone
- Not version controlled

**Steps:**
1. Create deployment package (zip)
2. Upload to Lambda console
3. Repeat for each function

### Option 3: AWS CLI Deployment
**Pros:**
- Scriptable
- Fast for single functions
- No CDK required

**Cons:**
- Manual packaging
- Need to know function names

**Steps:**
1. Package code: `zip -r function.zip backend/`
2. Update function: `aws lambda update-function-code`

## Deployment Package Structure

```
deployment-package/
├── backend/
│   ├── period/
│   │   └── handler.py (with DecimalEncoder)
│   ├── journal/
│   │   └── handler.py (with DecimalEncoder)
│   ├── wellness/
│   │   └── handler.py
│   └── utils/
│       ├── lambda_utils.py (with DecimalEncoder)
│       ├── dynamo_client.py
│       ├── dynamo_helper.py
│       └── bedrock_client.py
└── requirements.txt
```

## Verification Strategy

### 1. Pre-Deployment Checks
- Verify local code has DecimalEncoder in all handlers
- Check CloudWatch logs for current error frequency
- Document current error rate

### 2. Deployment Verification
- Check Lambda console shows updated code
- Verify last modified timestamp
- Check function configuration

### 3. Post-Deployment Testing
- Test GET /periods endpoint with curl or Postman
- Check CloudWatch logs for successful responses
- Verify frontend cycle tracking page loads data
- Monitor for 24 hours for any new errors

## Rollback Plan
If deployment causes issues:
1. AWS CDK: `cdk deploy --rollback`
2. AWS Console: Revert to previous version
3. AWS CLI: Deploy previous package

## Monitoring
- CloudWatch Logs: Monitor for "Decimal" errors
- CloudWatch Metrics: Track 500 error rate
- Frontend: User testing on cycle tracking page

## Security Considerations
- No changes to IAM roles required
- No changes to API Gateway configuration
- No changes to DynamoDB permissions
- DecimalEncoder only affects JSON serialization (safe)

## Performance Impact
- Minimal: DecimalEncoder adds negligible overhead
- No database query changes
- No API structure changes

## Dependencies
- Python 3.9+ (Lambda runtime)
- boto3 (AWS SDK)
- No new external dependencies

## Timeline
- Deployment: 5-10 minutes
- Verification: 15 minutes
- Total: ~30 minutes
