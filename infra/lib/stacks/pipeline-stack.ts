import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    BuildSpec, EventAction, FilterGroup, GitHubSourceCredentials, Project, Source
} from 'aws-cdk-lib/aws-codebuild';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "aws-cdk-lib/pipelines";
import { Deployment } from "../stages/deployment";
import { pipelines } from "aws-cdk-lib";

export class PipelineStack extends cdk.Stack {
    private readonly pipeline: CodePipeline;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const owner = 'raminismayilov';
        const repo = 'cdk-serverless-sfn';
        const branch = 'master';
        const token = cdk.SecretValue.secretsManager('github-token');

        new GitHubSourceCredentials(this, 'GitHubCreds', {
            accessToken: token,
        });

        const buildSpec = BuildSpec.fromObject({
            version: 0.2,
            phases: {
                install: {
                    commands: ['n 16', 'node -v', 'npm ci'],
                },
                build: {
                    commands: ['npm run test:infra', 'npm run cdk:synth']
                },
            },
        });

        const synthAction = new CodeBuildStep(`Synth`, {
            input: CodePipelineSource.gitHub(`${owner}/${repo}`, branch, {
                authentication: token,
            }),
            partialBuildSpec: buildSpec,
            commands: [],
            primaryOutputDirectory: "infra/cdk.out",
        });

        this.pipeline = new CodePipeline(this, 'Pipeline', {
            synth: synthAction,
        });

        const testStage = new Deployment(this, 'Test', {
            env: props?.env
        });

        this.pipeline.addStage(testStage, {
            post: [
                new CodeBuildStep('Test', {
                    commands: ['n 16', 'node -v', 'npm ci', 'npm run test:app'],
                    envFromCfnOutputs: {
                        MULTIPLICATION_API_URL: testStage.multiplicationApiUrl,
                    }
                })
            ]
        });

        const prodStage = new Deployment(this, 'Prod', {
            env: props?.env
        });

        this.pipeline.addStage(prodStage, {
            pre: [
                new pipelines.ManualApprovalStep('PromoteToProd'),
            ]
        });
    }
}
