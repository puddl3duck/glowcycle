import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class GlowCycleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // -------------------------
    // S3 Bucket
    // -------------------------
    const assetsBucket = new s3.Bucket(this, 'GlowCycleAssets', {
      bucketName: 'glowcycle-assets',
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // -------------------------
    // DynamoDB Table
    // -------------------------
    const table = new dynamodb.Table(this, 'GlowCycleTable', {
      partitionKey: { name: 'user', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: 'GlowCycleTable',
    });

    // -------------------------
    // Lambda Functions
    // -------------------------
    const skinLambda = new lambda.Function(this, 'SkinTrackingLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('../backend/skin'),
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: assetsBucket.bucketName,
      },
    });

    // -------------------------
    // Create a secret
    // -------------------------
    const glowCycleSecret = new secretsmanager.Secret(this, 'GlowCycleSecret', {
      secretName: 'glow-cycle-backend',
      description: 'Secrets for Glow Cycle backend Lambdas',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          s3_access_key: 'dummyfakedata',
          dynamodb_password: 'dummyfakedata',
        }),
        generateStringKey: 'secret_key',
      },
    });

    const journalLambda = new lambda.Function(this, 'JournalLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'journal.handler.lambda_handler',
      code: lambda.Code.fromAsset('../backend'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const periodLambda = new lambda.Function(this, 'PeriodTrackingLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('../backend/period'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    journalLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ["dynamodb:DescribeLimits"],
      resources: ["*"],  // Dynamo calls DescribeLimits on the account level
    }));
    // -------------------------
    // Permissions
    // -------------------------
    table.grantReadWriteData(skinLambda);
    table.grantReadWriteData(journalLambda);
    table.grantReadWriteData(periodLambda);
    glowCycleSecret.grantRead(skinLambda);
    glowCycleSecret.grantRead(journalLambda);
    glowCycleSecret.grantRead(periodLambda);
    assetsBucket.grantReadWrite(skinLambda);

    skinLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['rekognition:*'],
      resources: ['*'],
    }));

    journalLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));

    // -------------------------
    // API Gateway
    // -------------------------
    const api = new apigateway.RestApi(this, 'GlowCycleApi', {
      restApiName: 'Glow Cycle API',
    });

    api.root.addResource('skin')
      .addMethod('POST', new apigateway.LambdaIntegration(skinLambda));

    api.root.addResource('journal')
      .addMethod('POST', new apigateway.LambdaIntegration(journalLambda));

    api.root.addResource('period')
      .addMethod('POST', new apigateway.LambdaIntegration(periodLambda));
  }
}
