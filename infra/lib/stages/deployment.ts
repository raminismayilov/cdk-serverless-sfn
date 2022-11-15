import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ComputeStack } from "../stacks/compute-stack";
import { CfnOutput } from "aws-cdk-lib";

export class Deployment extends cdk.Stage {
    public readonly multiplicationApiUrl: CfnOutput;

    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);

        const computeStack = new ComputeStack(this, "ComputeStack", {
            env: props?.env,
            stageName: id,
        });

        this.multiplicationApiUrl = computeStack.multiplicationApiUrl;
    }
}
