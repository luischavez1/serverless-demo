import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class OrdersStack extends cdk.Stack {
  public readonly handler: lambda.IFunction;
  createOrderHandler: cdk.aws_lambda.Function;
  getOrdersHandler: cdk.aws_lambda.Function;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.createOrderHandler = new lambda.Function(this, 'CreateOrderFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'createOrder.handler',
      code: lambda.Code.fromAsset('lambda/orders'),
    });

    // Lambda to get orders
    this.getOrdersHandler = new lambda.Function(this, 'GetOrdersFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getOrders.handler',
      code: lambda.Code.fromAsset('lambda/orders'),
    });

  }
}
