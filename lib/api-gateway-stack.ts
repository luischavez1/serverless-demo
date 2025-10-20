import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';

interface ApiGatewayStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
  createOrderHandler: lambda.IFunction;
  getOrdersHandler: lambda.IFunction;
  paymentHandler: lambda.IFunction;
}

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [props.userPool],
    });

    const api = new apigateway.RestApi(this, 'EcommerceApi', {
      restApiName: 'Ecommerce API',
    });

    // Orders
    const orders = api.root.addResource('orders');
    orders.addMethod('POST', new apigateway.LambdaIntegration(props.createOrderHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    orders.addMethod('GET', new apigateway.LambdaIntegration(props.getOrdersHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    // Payments
    const payments = api.root.addResource('payments');
    payments.addMethod('GET', new apigateway.LambdaIntegration(props.paymentHandler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
