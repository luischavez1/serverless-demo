import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  const user = event.requestContext.authorizer?.claims?.email || 'anonymous';

  const fakeOrders = [
    {
      orderId: `order-${Date.now()}`,
      user,
      items: [{ id: 'giftcard-10usd', quantity: 1 }],
      total: 10.0,
      status: 'CREATED2 Prueba',
    },
  ];

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fakeOrders, null, 2),
  };
};
