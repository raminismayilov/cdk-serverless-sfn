import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ComputeStack } from "../stacks/compute-stack";

export class TestStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);

        const computeStack = new ComputeStack(this, "ComputeStack", {
            env: props?.env,
            stageName: id,
        });
    }
}
