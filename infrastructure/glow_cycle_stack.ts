import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
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
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ["*"], // Allow all origins for development
          allowedHeaders: ["*"],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
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
    const skinUploadUrlLambda = new lambda.Function(this, "SkinUploadUrlLambda", {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "skin/upload_url.lambda_handler",
      code: lambda.Code.fromAsset("../backend", { exclude: ["journal/", "period/"] }),
      environment: {
        BUCKET_NAME: assetsBucket.bucketName,
      },
    });

    const skinAnalyzeLambda = new lambda.Function(this, "SkinAnalyzeLambda", {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "skin/analyze.lambda_handler",
      code: lambda.Code.fromAsset("../backend", { exclude: ["journal/", "period/"] }),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
      BUCKET_NAME: assetsBucket.bucketName,
      // Put the Claude Sonnet 4.5 v1 model id here (copy from Bedrock model catalog "API details")
      BEDROCK_MODEL_ID: "global.anthropic.claude-sonnet-4-5-20250929-v1:0",
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
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });

    const periodLambda = new lambda.Function(this, 'PeriodTrackingLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'period.handler.lambda_handler',
      code: lambda.Code.fromAsset('../backend'),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });

    const wellnessLambda = new lambda.Function(this, 'WellnessAILambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'wellness.handler.lambda_handler',
      code: lambda.Code.fromAsset('../backend'),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
      timeout: cdk.Duration.seconds(30), // Bedrock calls may take longer
    });
    journalLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ["dynamodb:DescribeLimits"],
      resources: ["*"],  // Dynamo calls DescribeLimits on the account level
    }));
    // -------------------------
    // Permissions
    // -------------------------
    table.grantReadWriteData(journalLambda);
    table.grantReadWriteData(periodLambda);
    table.grantReadData(wellnessLambda); // Wellness only needs read access
    glowCycleSecret.grantRead(journalLambda);
    glowCycleSecret.grantRead(periodLambda);
    glowCycleSecret.grantRead(wellnessLambda);
    assetsBucket.grantWrite(skinUploadUrlLambda);
    assetsBucket.grantRead(skinAnalyzeLambda);
    assetsBucket.grantPut(skinUploadUrlLambda);

    journalLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      }),
    );
    
    wellnessLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      }),
    );
    
    skinAnalyzeLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["rekognition:DetectFaces"],
        resources: ["*"],
      }),
    );

   skinAnalyzeLambda.addToRolePolicy(
      new iam.PolicyStatement({
      actions: ["bedrock:InvokeModel", "bedrock:Converse"],
      resources: [
          "arn:aws:bedrock:*::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0",
          "arn:aws:bedrock:*:*:inference-profile/global.anthropic.claude-sonnet-4-5-20250929-v1:0",
          "arn:aws:bedrock:*:*:inference-profile/global.anthropic.claude-sonnet-4-5-20250929-v1:0"
      ],
     }),
    );

    wellnessLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));

    wellnessLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ["dynamodb:DescribeLimits"],
      resources: ["*"],
    }));

    // -------------------------
    // API Gateway
    // -------------------------
    const api = new apigateway.RestApi(this, 'GlowCycleApi', {
      restApiName: 'Glow Cycle API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Requested-With'
        ],
      },
    });
    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: api.url,
    });

    const skinResource = api.root.addResource("skin");

    const uploadUrlResource = skinResource.addResource("upload-url");
    const analyzeResource = skinResource.addResource("analyze");

    const uploadUrlMethod = uploadUrlResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(skinUploadUrlLambda),
    );

    const analyzeMethod = analyzeResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(skinAnalyzeLambda),
    );

    const skinHistoryLambda = new lambda.Function(this, 'SkinHistoryLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'skin/history.lambda_handler',
      code: lambda.Code.fromAsset('../backend'),
      environment: { DYNAMODB_TABLE_NAME: table.tableName },
    });
    table.grantReadWriteData(skinHistoryLambda);

    const skinHistory = api.root.getResource('skin')!.addResource('history');
    skinHistory.addMethod('POST', new apigateway.LambdaIntegration(skinHistoryLambda));
    skinHistory.addMethod('GET', new apigateway.LambdaIntegration(skinHistoryLambda));

    // Journal (ONE resource, multiple methods)
    const journalResource = api.root.addResource('journal');

    journalResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(journalLambda)
    );

    journalResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(journalLambda)
    );

    // Period tracking (multiple methods)
    const periodResource = api.root.addResource('period');
    
    periodResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(periodLambda)
    );
    
    periodResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(periodLambda)
    );
    
    periodResource.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(periodLambda)
    );

    // Wellness AI endpoint
    const wellnessResource = api.root.addResource('wellness');
    
    wellnessResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(wellnessLambda)
    );

    // Judge setup endpoint
    const judgeSetupLambda = new lambda.Function(this, 'JudgeSetupLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'judge/handler.lambda_handler',
      code: lambda.Code.fromAsset('../backend'),
      environment: { DYNAMODB_TABLE_NAME: table.tableName },
    });
    table.grantReadWriteData(judgeSetupLambda);

    const judgeResource = api.root.addResource('judge');
    const judgeSetupResource = judgeResource.addResource('setup');
    
    judgeSetupResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(judgeSetupLambda)
    );
    
    judgeSetupResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(judgeSetupLambda)
    );

    // User management endpoints
    const userLambda = new lambda.Function(this, 'UserLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'user/lambda_handler.lambda_handler',
      code: lambda.Code.fromAsset('../backend'),
      environment: { DYNAMODB_TABLE_NAME: table.tableName },
    });
    table.grantReadWriteData(userLambda);

    const userResource = api.root.addResource('user');
    
    // User creation endpoint
    const userCreateResource = userResource.addResource('create');
    userCreateResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(userLambda)
    );
    
    // User authentication endpoint
    const userAuthResource = userResource.addResource('authenticate');
    userAuthResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(userLambda)
    );
    
    // User setup completion endpoint
    const userSetupResource = userResource.addResource('complete-setup');
    userSetupResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(userLambda)
    );
  }
}
