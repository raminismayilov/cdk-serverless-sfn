import {
    aws_ec2 as ec2,
    aws_rds as rds,
    RemovalPolicy,
    Duration,
    StackProps,
    Stack,
    aws_iam as iam, CfnOutput
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface DatabaseStackProps extends StackProps {
    vpc: ec2.IVpc;
}

export class DatabaseStack extends Stack {
    public readonly privateSg: ec2.SecurityGroup;
    public readonly rdsCredentials: rds.DatabaseSecret;
    public readonly rdsProxy: rds.DatabaseProxy;

    public readonly dbHost: CfnOutput;
    public readonly dbSecretArn: CfnOutput;

    constructor(scope: Construct, id: string, props: DatabaseStackProps) {
        super(scope, id, props);

        // Security Groups
        const publicSg = new ec2.SecurityGroup(this, 'public-sg', {
            vpc: props.vpc,
            securityGroupName: 'public-sg',
        });
        publicSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Bastion Host SSH connection');

        this.privateSg = new ec2.SecurityGroup(this, 'private-sg', {
            vpc: props.vpc,
            securityGroupName: 'private-sg',
        });
        this.privateSg.addIngressRule(publicSg, ec2.Port.tcp(5432), 'allow access to RDS');
        this.privateSg.addIngressRule(this.privateSg, ec2.Port.allTraffic(), 'allow internal SG access');

        // Tunnel to RDS via EC2 instance
        const keyName = this.node.tryGetContext('ec2_ssh_key');
        const ec2Instance = new ec2.Instance(this, 'bastion-host', {
            vpc: props.vpc,
            keyName,
            instanceName: 'bastion-host',
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: ec2.MachineImage.latestAmazonLinux({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            securityGroup: publicSg,
        });
        ec2Instance.role.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
        );

        // Secret for RDS username and password
        this.rdsCredentials = new rds.DatabaseSecret(this, 'RdsCredentials', {
            secretName: 'RdsCredentials',
            username: 'postgres',
        });

        // RDS Postgres instance and its Subnet Group
        const subnetGroup = new rds.SubnetGroup(this, 'RdsSubnetGroup', {
            vpc: props.vpc,
            subnetGroupName: 'RdsSubnetGroup',
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
            removalPolicy: RemovalPolicy.DESTROY,
            description: 'An all private subnets group',
        });

        const pg = new rds.DatabaseInstance(this, 'RdsInstance', {
            vpc: props.vpc,
            subnetGroup,
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_13,
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            allocatedStorage: 20,
            securityGroups: [this.privateSg],
            databaseName: 'postgres',
            removalPolicy: RemovalPolicy.DESTROY,
            autoMinorVersionUpgrade: false,
            credentials: rds.Credentials.fromSecret(this.rdsCredentials),
        });

        this.rdsProxy = pg.addProxy('RdsProxy', {
            vpc: props.vpc,
            secrets: [this.rdsCredentials],
            requireTLS: false,
            dbProxyName: 'RdsProxy',
            idleClientTimeout: Duration.minutes(60),
            maxConnectionsPercent: 100,
            vpcSubnets: props.vpc.selectSubnets({
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            }),
            securityGroups: [this.privateSg],
        });

        // VPC Interface Endpoint to access the database secret
        new ec2.InterfaceVpcEndpoint(this, 'SecretsManager', {
            service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
            vpc: props.vpc,
            privateDnsEnabled: true,
            subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
            securityGroups: [this.privateSg],
        });

        this.dbHost = new CfnOutput(this, 'RdsProxyEndpoint', {
            value: this.rdsProxy.endpoint,
        });

        this.dbSecretArn = new CfnOutput(this, 'RdsCredentialsSecretArn', {
            value: this.rdsCredentials.secretArn,
        });
    }
}
