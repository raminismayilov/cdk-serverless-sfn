import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    aws_lambda as lambda,
} from "aws-cdk-lib";
import {
    NodejsFunction, NodejsFunctionProps
} from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export class InfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const addition = new NodejsFunction(this, 'Addition', {
            entry: path.join(__dirname, '..', '..', 'app', 'addition', 'index.ts'),
            runtime: lambda.Runtime.NODEJS_16_X,
        });
    }
}
