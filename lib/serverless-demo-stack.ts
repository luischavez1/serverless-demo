import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class ServerlessDemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Cognito User Pool
    const userPool = new cognito.UserPool(this, 'DemoUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      passwordPolicy: { minLength: 6, requireLowercase: false, requireUppercase: false },
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'DemoUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: { userPassword: true },
    });

    // 2. Lambda function
    const createOrderLambda = new lambda.Function(this, 'CreateOrderLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'createOrder.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        REGION: this.region,
      },
    });

    // 3. API Gateway
    const api = new apigw.RestApi(this, 'DemoApi', {
      restApiName: 'Serverless Demo API',
      description: 'Simple demo of Cognito + API Gateway + Lambda.',
    });

    // 4. Cognito authorizer
    const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'DemoAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // 5. Secure endpoint /orders
    const orders = api.root.addResource('orders');
    orders.addMethod('POST', new apigw.LambdaIntegration(createOrderLambda), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // Output info
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
  }
}
