import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { PhysicalName } from 'aws-cdk-lib';

export interface OrdersStackProps extends cdk.StackProps {
  vpc?: ec2.IVpc;
  dbSecret?: secretsmanager.ISecret;
  cluster?: rds.IDatabaseCluster;
}

export class OrdersStack extends cdk.Stack {
  public readonly createOrderHandler: lambda.Function;
  public readonly getOrdersHandler: lambda.Function;

  constructor(scope: cdk.App, id: string, props?: OrdersStackProps) {
    super(scope, id, props);

    const dbSecret = props?.dbSecret ?? secretsmanager.Secret.fromSecretNameV2(this, 'ImportedDBSecret', 'DemoDBCredentials');
    const vpc = props?.vpc ?? ec2.Vpc.fromLookup(this, 'DefaultVpc', { vpcId: process.env.VPC_ID });
    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
    
    const cluster = props?.cluster ?? rds.DatabaseCluster.fromDatabaseClusterAttributes(this, 'ImportedDemoCluster', {
      clusterIdentifier: process.env.DB_CLUSTER_IDENTIFIER!,
      clusterEndpointAddress: process.env.DB_ENDPOINT!,
      port: port,
      securityGroups: [ec2.SecurityGroup.fromSecurityGroupId(this, 'ImportedDBSG', process.env.DB_SECURITY_GROUP_ID!)],
    });

    const environment = {
        DB_HOST: dbSecret.secretValueFromJson('host').unsafeUnwrap(),
        DB_PORT: dbSecret.secretValueFromJson('port').unsafeUnwrap(),
        DB_NAME: dbSecret.secretValueFromJson('database').unsafeUnwrap(),
        DB_USER: dbSecret.secretValueFromJson('username').unsafeUnwrap(),
        DB_PASSWORD: dbSecret.secretValueFromJson('password').unsafeUnwrap(),
        DB_SECRET_ARN: dbSecret.secretValueFromJson('secretArn').unsafeUnwrap(),
      };

    this.createOrderHandler = new lambda.Function(this, 'CreateOrderFn', {
      functionName: PhysicalName.GENERATE_IF_NEEDED,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'createOrder.handler',
      code: lambda.Code.fromAsset('lambda/orders'),
      vpc,
      allowPublicSubnet: true,
      environment: environment,
    });
    this.createOrderHandler.connections.allowTo(cluster, ec2.Port.tcp(5432), 'Allow Lambda to access RDS cluster');

    this.getOrdersHandler = new lambda.Function(this, 'GetOrdersFn', {
      functionName: PhysicalName.GENERATE_IF_NEEDED,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getOrders.handler',
      code: lambda.Code.fromAsset('lambda/orders'),
      allowPublicSubnet: true,
      vpc,
      environment: environment,
    });

    dbSecret.grantRead(this.createOrderHandler);
    dbSecret.grantRead(this.getOrdersHandler);

    cluster.connections.allowDefaultPortFrom(this.createOrderHandler, 'Allow CreateOrder Lambda to access RDS cluster');
    cluster.connections.allowDefaultPortFrom(this.getOrdersHandler, 'Allow GetOrders Lambda to access RDS cluster');
  }
}
