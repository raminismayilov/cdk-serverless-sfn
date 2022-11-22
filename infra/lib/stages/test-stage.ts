import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2, aws_rds as rds, StackProps, Stack, aws_iam as iam, Duration, CfnOutput } from 'aws-cdk-lib';
import { VpcStack } from "../stacks/vpc";
import { DatabaseStack } from "../stacks/database";
import { ComputeStack } from "../stacks/compute";

export class TestStage extends cdk.Stage {
    public readonly apiUrl: CfnOutput;
    public readonly dbHost: CfnOutput;
    public readonly dbSecretArn: CfnOutput;

    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
        super(scope, id, props);

        const vpcStack = new VpcStack(this, 'VpcStack');

        const databaseStack = new DatabaseStack(this, 'TestDatabaseStack', {
            stackName: 'TestDatabaseStack',
            vpc: vpcStack.vpc,
        });

        const computeStack = new ComputeStack(this, 'TestComputeStack', {
            stackName: 'TestComputeStack',
            vpc: vpcStack.vpc,
            privateSg: databaseStack.privateSg,
            rdsCredentials: databaseStack.rdsCredentials,
            rdsProxy: databaseStack.rdsProxy,
        });

        this.apiUrl = computeStack.api.apiUrl;
        this.dbHost = databaseStack.dbHost;
        this.dbSecretArn = databaseStack.dbSecretArn;

        databaseStack.addDependency(vpcStack);
        computeStack.addDependency(databaseStack);
    }
}
