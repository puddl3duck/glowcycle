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
    const skinUploadLambda = new lambda.Function(this, 'SkinUploadLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('../backend/skin'),
      environment: {
        BUCKET_NAME: assetsBucket.bucketName,
      },
    });
    const skinProcessLambda = new lambda.Function(this, 'SkinProcessLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('../backend/skin'),
      environment: {
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
    glowCycleSecret.grantRead(skinProcessLambda);
    glowCycleSecret.grantRead(skinUploadLambda);
    glowCycleSecret.grantRead(journalLambda);
    glowCycleSecret.grantRead(periodLambda);
    glowCycleSecret.grantRead(wellnessLambda);
    assetsBucket.grantRead(skinProcessLambda);
    assetsBucket.grantWrite(skinUploadLambda);


    skinProcessLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['rekognition:DetectFaces'],
      resources: ['*'],
    }));

    journalLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));

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

    assetsBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(skinProcessLambda),
      { prefix: 'selfies/' }
    );

    api.root.addResource('skin')
      .addMethod('POST', new apigateway.LambdaIntegration(skinUploadLambda));

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
  }
}
