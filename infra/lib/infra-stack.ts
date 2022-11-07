import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    aws_lambda as lambda,
    aws_stepfunctions as sfn,
    aws_stepfunctions_tasks as tasks,
    Duration,
} from "aws-cdk-lib";
import {
    NodejsFunction
} from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export class InfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const addition = new NodejsFunction(this, 'Addition', {
            entry: path.join(__dirname, '..', '..', 'app', 'addition', 'addition.ts'),
            runtime: lambda.Runtime.NODEJS_16_X,
        });

        const square = new NodejsFunction(this, 'Square', {
            entry: path.join(__dirname, '..', '..', 'app', 'square', 'square.ts'),
            runtime: lambda.Runtime.NODEJS_16_X,
        });

        const multiplication = new NodejsFunction(this, 'Multiplication', {
            entry: path.join(__dirname, '..', '..', 'app', 'multiplication', 'multiplication.ts'),
            runtime: lambda.Runtime.NODEJS_16_X,
        });

        const additionStep = new tasks.LambdaInvoke(this, 'Addition Step', {
            lambdaFunction: addition,
            inputPath: '$',
            outputPath: '$',
        });

        const squareStep = new tasks.LambdaInvoke(this, 'Square Step', {
            lambdaFunction: square,
            inputPath: '$.Payload',
            outputPath: '$',
        });

        const waitStep = new sfn.Wait(this, 'Wait Step', {
            time: sfn.WaitTime.duration(Duration.seconds(5)),
        });

        const definition = additionStep.next(waitStep).next(squareStep);

        const simpleStateMachine = new sfn.StateMachine(this, 'Simple State Machine', {
            definition,
            timeout: Duration.minutes(5),
        });
    }
}
