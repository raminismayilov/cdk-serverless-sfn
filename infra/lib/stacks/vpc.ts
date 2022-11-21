import { Construct } from 'constructs';
import { aws_ec2 as ec2, aws_iam as iam, Stack } from 'aws-cdk-lib';

export class VpcStack extends Stack {
    public readonly vpc: ec2.IVpc;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // VPC with public and private subnets
        this.vpc = new ec2.Vpc(this, 'serverless-app', {
            cidr: '10.0.0.0/20',
            natGateways: 0,
            maxAzs: 2,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            subnetConfiguration: [
                {
                    cidrMask: 22,
                    name: 'public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 22,
                    name: 'private',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });
    }
}
