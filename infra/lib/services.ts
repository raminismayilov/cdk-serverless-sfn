import * as path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { NodejsServiceFunction } from './constructs/service';
import { aws_ec2 as ec2, aws_rds as rds, StackProps, aws_iam as iam, Duration } from 'aws-cdk-lib';

interface ServicesProps extends StackProps {
    vpc: ec2.IVpc;
    privateSg: ec2.SecurityGroup;
    rdsCredentials: rds.DatabaseSecret;
    rdsProxy: rds.DatabaseProxy;
}

export class Services extends Construct {
    public readonly moduleService: NodejsFunction;
    public readonly migrationService: NodejsFunction;

    constructor(scope: Construct, id: string, props: ServicesProps) {
        super(scope, id);

        const rdsRole = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['secretsmanager:GetSecretValue'],
            resources: [props.rdsCredentials.secretArn],
        });

        const environment = {
            DB_HOST: props.rdsProxy.endpoint,
            DB_SECRET_ARN: props.rdsCredentials.secretArn,
        };

        const nodeModules = ['knex', 'pg'];

        const serviceProps = {
            vpc: props.vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
            securityGroups: [props.privateSg],
            timeout: Duration.seconds(10),
            memorySize: 512,
            environment,
            bundling: {
                nodeModules,
            },
        };

        this.moduleService = new NodejsServiceFunction(this, 'ModuleCrudLambda', {
            ...serviceProps,
            entry: path.join(__dirname, '..', '..', 'app', 'module', 'index.ts'),
            functionName: 'ModuleCrudLambda',
        });

        this.moduleService.addToRolePolicy(rdsRole);

        this.migrationService = new NodejsServiceFunction(this, 'MigrationLambda', {
            ...serviceProps,
            entry: path.join(__dirname, '..', '..', 'app', 'migrator', 'index.ts'),
            functionName: 'MigrationLambda',
        });

        this.migrationService.addToRolePolicy(rdsRole);
    }
}
