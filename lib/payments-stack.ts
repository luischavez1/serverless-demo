import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class PaymentsStack extends cdk.Stack {
  public readonly handler: lambda.IFunction;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.handler = new lambda.Function(this, 'PaymentsHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getPayments.handler',
      code: lambda.Code.fromAsset('lambda/payments'),
    });

  }
}
