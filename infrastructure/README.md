# 🏗 Glow Cycle Infrastructure

AWS CDK infrastructure for Glow Cycle, written in TypeScript.

## 📁 Structure

```
infrastructure/
├── glow_cycle.ts         # CDK app entry point
├── glow_cycle_stack.ts   # Main stack definition
├── cdk.json              # CDK configuration
├── package.json          # Node dependencies
├── package-lock.json     # Locked dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- AWS CLI configured
- AWS CDK CLI (`npm install -g aws-cdk`)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build TypeScript**
   ```bash
   npm run build
   ```

3. **Bootstrap CDK** (first time only)
   ```bash
   cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

## 📦 Stack Resources

### Compute
- **Lambda Functions**
  - `glow-cycle-journal` - Journal operations
  - `glow-cycle-period` - Period tracking
  - `glow-cycle-skin` - Skin tracking

### Storage
- **DynamoDB Tables**
  - `glow-cycle-journal` - Journal entries
  - `glow-cycle-period` - Period data
  - `glow-cycle-skin` - Skin data
  
- **S3 Buckets**
  - `glow-cycle-frontend` - Static website hosting
  - `glow-cycle-assets` - User uploads

### API
- **API Gateway**
  - REST API with CORS enabled
  - Lambda proxy integration
  - API key authentication

### AI/ML
- **AWS Bedrock**
  - Claude model for skin analysis
  - Personalised recommendations

## 🛠 CDK Commands

### Synthesize CloudFormation
```bash
npm run cdk synth
```

### Deploy Stack
```bash
npm run cdk deploy
```

### Destroy Stack
```bash
npm run cdk destroy
```

### Diff Changes
```bash
npm run cdk diff
```

### List Stacks
```bash
npm run cdk list
```

## 🔧 Configuration

### CDK Context
Edit `cdk.json` to configure:

```json
{
  "app": "npx ts-node glow_cycle.ts",
  "context": {
    "environment": "production",
    "region": "us-east-1",
    "account": "123456789012"
  }
}
```

### Environment Variables
Set in your shell or CI/CD:

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=123456789012
export ENVIRONMENT=production
```

## 🏗 Stack Definition

### Example Stack
```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class GlowCycleStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'JournalTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'entryId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // Lambda Function
    const handler = new lambda.Function(this, 'JournalHandler', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset('../backend'),
      handler: 'journal.handler.lambda_handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant permissions
    table.grantReadWriteData(handler);

    // API Gateway
    const api = new apigateway.RestApi(this, 'GlowCycleApi', {
      restApiName: 'Glow Cycle API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const journal = api.root.addResource('journal');
    journal.addMethod('POST', new apigateway.LambdaIntegration(handler));
  }
}
```

## 🚀 Deployment

### Development
```bash
# Deploy to dev environment
cdk deploy --context environment=development
```

### Production
```bash
# Deploy to production
cdk deploy --context environment=production --require-approval never
```

### CI/CD
```bash
# In GitHub Actions
- name: Deploy CDK
  run: |
    cd infrastructure
    npm ci
    npm run build
    npm run cdk deploy -- --require-approval never
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 📊 Monitoring

### CloudWatch Dashboards
```typescript
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';

const dashboard = new cloudwatch.Dashboard(this, 'GlowCycleDashboard', {
  dashboardName: 'GlowCycle',
});

dashboard.addWidgets(
  new cloudwatch.GraphWidget({
    title: 'Lambda Invocations',
    left: [handler.metricInvocations()],
  })
);
```

### Alarms
```typescript
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';

const topic = new sns.Topic(this, 'AlarmTopic');

new cloudwatch.Alarm(this, 'ErrorAlarm', {
  metric: handler.metricErrors(),
  threshold: 10,
  evaluationPeriods: 1,
  alarmDescription: 'Lambda function errors',
});
```

## 🔒 Security

### IAM Policies
```typescript
import * as iam from 'aws-cdk-lib/aws-iam';

handler.addToRolePolicy(new iam.PolicyStatement({
  actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
  resources: [table.tableArn],
}));
```

### Encryption
- DynamoDB: AWS managed encryption
- S3: Server-side encryption (SSE-S3)
- Lambda: Environment variables encrypted with KMS

### VPC
```typescript
import * as ec2 from 'aws-cdk-lib/aws-ec2';

const vpc = new ec2.Vpc(this, 'GlowCycleVpc', {
  maxAzs: 2,
});

const handler = new lambda.Function(this, 'Handler', {
  // ...
  vpc: vpc,
  vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
});
```

## 💰 Cost Optimization

### Best Practices
- Use on-demand billing for DynamoDB
- Set Lambda memory appropriately
- Enable S3 lifecycle policies
- Use CloudWatch Logs retention
- Enable AWS Cost Explorer

### Estimated Costs
- Lambda: ~$0.20 per 1M requests
- DynamoDB: ~$1.25 per million writes
- S3: ~$0.023 per GB
- API Gateway: ~$3.50 per million requests

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### CDK Assertions
```typescript
import { Template } from 'aws-cdk-lib/assertions';

test('Lambda Function Created', () => {
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'python3.9',
  });
});
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: CDK bootstrap failed
- **Solution**: Ensure AWS credentials are configured correctly

**Issue**: Stack deployment failed
- **Solution**: Check CloudFormation events in AWS Console

**Issue**: Lambda function not found
- **Solution**: Verify the handler path in stack definition

## 📚 Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [CDK Patterns](https://cdkpatterns.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

**Last Updated**: 2026-02-14  
**Version**: 2.0
