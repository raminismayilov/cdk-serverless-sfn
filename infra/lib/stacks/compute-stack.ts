import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    aws_lambda as lambda,
    aws_stepfunctions as sfn,
    aws_stepfunctions_tasks as tasks,
    CfnOutput,
    Duration,
} from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';
import { ApplicationAPI } from "../api";

interface ComputeStackProps extends cdk.StackProps {
    stageName: string;
}

export class ComputeStack extends cdk.Stack {
    public readonly multiplicationApiUrl: CfnOutput;

    constructor(scope: Construct, id: string, props: ComputeStackProps) {
        super(scope, id, props);

        const addition = new NodejsFunction(this, 'Addition', {
            entry: path.join(__dirname, '..', '..', '..', 'app', 'addition', 'addition.ts'),
            runtime: lambda.Runtime.NODEJS_16_X,
            functionName: `${props?.stageName}-addition`,
        });

        const square = new NodejsFunction(this, 'Square', {
            entry: path.join(__dirname, '..', '..', '..', 'app', 'square', 'square.ts'),
            runtime: lambda.Runtime.NODEJS_16_X,
            functionName: `${props?.stageName}-square`,
        });

        const multiplication = new NodejsFunction(this, 'Multiplication', {
            entry: path.join(__dirname, '..', '..', '..', 'app', 'multiplication', 'multiplication.ts'),
            runtime: lambda.Runtime.NODEJS_16_X,
            functionName: `${props?.stageName}-multiplication`,
        });

        const applicationApi = new ApplicationAPI(this, 'ApplicationAPI', {
            multiplicationService: multiplication,
        });
        this.multiplicationApiUrl = applicationApi.multiplicationApiUrl;

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
            time: sfn.WaitTime.duration(Duration.seconds(3)),
        });

        const definition = additionStep.next(waitStep).next(squareStep);

        const simpleStateMachine = new sfn.StateMachine(this, 'Simple State Machine', {
            definition,
            timeout: Duration.minutes(5),
            stateMachineName: `${props?.stageName}-simple-state-machine`,
        });
    }
}
