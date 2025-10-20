import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  const user = event.requestContext.authorizer?.claims?.email || 'anonymous';

  const fakePayments = [
    {
      paymentId: `payment-${Date.now()}`,
      user,
      amount: 10.0,
      status: 'CREATED',
    },
  ];

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fakePayments, null, 2),
  };
};
