#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { OrdersStack } from '../lib/orders-stack';
import { ApiGatewayStack } from '../lib/api-gateway-stack';
import { PaymentsStack } from '../lib/payments-stack';

const app = new cdk.App();

const auth = new AuthStack(app, 'AuthStack');
const orders = new OrdersStack(app, 'OrdersStack');
const payments = new PaymentsStack(app, 'PaymentsStack');

// API Gateway depends on Cognito + services
new ApiGatewayStack(app, 'ApiGatewayStack', {
  userPool: auth.userPool,
  createOrderHandler: orders.createOrderHandler,
  getOrdersHandler: orders.getOrdersHandler,
  paymentHandler: payments.handler,
});