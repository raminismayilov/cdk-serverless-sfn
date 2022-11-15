import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ComputeStack } from "../stacks/compute-stack";
import { CfnOutput } from "aws-cdk-lib";

export class TestStage extends cdk.Stage {
    public readonly multiplicationLambdaUrl: CfnOutput;

    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);

        const computeStack = new ComputeStack(this, "ComputeStack", {
            env: props?.env,
            stageName: id,
        });

        // this.multiplicationLambdaUrl = computeStack.multiplicationLambdaUrl;
    }
}
