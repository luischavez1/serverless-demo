import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  const user = event.requestContext.authorizer?.claims?.email || 'anonymous';
  
  const fakeOrder = {
    orderId: `order-${Date.now()}`,
    user,
    items: [{ id: 'giftcard-10usd', quantity: 1 }],
    total: 10.0,
    status: 'CREATED',
    createdAt: new Date().toISOString(),
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fakeOrder, null, 2),
  };
};
