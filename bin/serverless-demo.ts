#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { OrdersStack } from '../lib/orders-stack';
import { ApiGatewayStack } from '../lib/api-gateway-stack';
import { PaymentsStack } from '../lib/payments-stack';
import 'dotenv/config';

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const authStack = new AuthStack(app, 'AuthStack', { env });
const ordersStack = new OrdersStack(app, 'OrdersStack', { env });
const paymentsStack = new PaymentsStack(app, 'PaymentsStack', { env });

const apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewayStack', {
  userPoolArn: authStack.userPool.userPoolArn,
  userPool: authStack.userPool,
  createOrderHandler: ordersStack.createOrderHandler,
  getOrdersHandler: ordersStack.getOrdersHandler,
  paymentHandler: paymentsStack.handler,
  env,
});

apiGatewayStack.addDependency(authStack);
apiGatewayStack.addDependency(ordersStack);
apiGatewayStack.addDependency(paymentsStack);