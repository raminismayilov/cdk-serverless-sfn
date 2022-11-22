import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { aws_ec2 as ec2, aws_iam as iam, aws_rds as rds } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Services } from '../services';
import { API } from '../api';

interface ComputeStackProps extends StackProps {
    vpc: ec2.IVpc;
    privateSg: ec2.SecurityGroup;
    rdsCredentials: rds.DatabaseSecret;
    rdsProxy: rds.DatabaseProxy;
}

export class ComputeStack extends Stack {
    public readonly api: API;

    constructor(scope: Construct, id: string, props: ComputeStackProps) {
        super(scope, id, props);

        const services = new Services(this, 'Services', props);

        this.api = new API(this, 'Pv', {
            moduleService: services.moduleService,
            migrationService: services.migrationService,
        });
    }
}
