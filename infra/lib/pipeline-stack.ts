import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Artifact, IStage, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import {
    CloudFormationCreateUpdateStackAction,
    CodeBuildAction,
    CodeBuildActionType,
    GitHubSourceAction,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import {
    BuildEnvironmentVariableType,
    BuildSpec,
    LinuxBuildImage,
    PipelineProject,
} from 'aws-cdk-lib/aws-codebuild';
import { BillingStack } from "./billing-stack";
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "aws-cdk-lib/pipelines";

interface ServiceEndpoints {
    multiplicationLambdaUrl: string;
    additionLambdaUrl: string;
    squareLambdaUrl: string;
}

export class PipelineStack extends cdk.Stack {
    private readonly pipeline: CodePipeline;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const owner = 'raminismayilov';
        const repo = 'cdk-serverless-sfn';
        const branch = 'feature/codepipeline';
        const token = cdk.SecretValue.secretsManager('github-token');

        const pipelineSpec = BuildSpec.fromObject({
            version: 0.2,
            phases: {
                install: {
                    commands: ['n latest', 'node -v', 'npm ci'],
                },
                build: {
                    commands: ['npm run test:infra', 'npm run cdk:synth']
                }
            }
        });

        const synthAction = new CodeBuildStep(`Synth`, {
            input: CodePipelineSource.gitHub(`${owner}/${repo}`, branch, {
                authentication: token,
            }),
            partialBuildSpec: pipelineSpec,
            commands: [],
        });

        this.pipeline = new CodePipeline(this, 'Pipeline', {
            synth: synthAction,
        });
    }
}
