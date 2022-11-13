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

interface ServiceEndpoints {
    multiplicationLambdaUrl: string;
    additionLambdaUrl: string;
    squareLambdaUrl: string;
}

export class PipelineStack extends cdk.Stack {
    private readonly pipeline: Pipeline;
    private readonly sourceOutput: Artifact;
    private readonly buildOutput: Artifact;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.pipeline = new Pipeline(this, 'Pipeline', {
            pipelineName: 'MyPipeline',
            crossAccountKeys: false,
            restartExecutionOnUpdate: true,
        });

        this.sourceOutput = new Artifact('SourceOutput');

        const sourceAction = new GitHubSourceAction({
            actionName: 'Source',
            owner: 'raminismayilov',
            repo: 'cdk-serverless-sfn',
            branch: 'master',
            oauthToken: cdk.SecretValue.secretsManager('github-token'),
            output: this.sourceOutput,
        });

        this.pipeline.addStage({
            stageName: 'Source',
            actions: [sourceAction],
        });

        this.buildOutput = new Artifact('BuildOutput');

        const buildAction = new CodeBuildAction({
            actionName: 'PipelineBuild',
            input: this.sourceOutput,
            outputs: [this.buildOutput],
            project: new PipelineProject(this, 'BuildProject', {
                environment: {
                    buildImage: LinuxBuildImage.STANDARD_5_0,
                },
                buildSpec: BuildSpec.fromSourceFilename('infra/build-specs/build-spec.yml'),
            }),
        });

        this.pipeline.addStage({
            stageName: 'Build',
            actions: [buildAction],
        });

        const pipelineUpdateAction = new CloudFormationCreateUpdateStackAction({
            actionName: 'PipelineUpdate',
            stackName: 'PipelineStack',
            templatePath: this.buildOutput.atPath('PipelineStack.template.json'),
            adminPermissions: true,
        });

        this.pipeline.addStage({
            stageName: 'Pipeline_Update',
            actions: [pipelineUpdateAction],
        });
    }

    public addServiceStage(serviceStack: cdk.Stack, stageName: string): IStage {
        return this.pipeline.addStage({
            stageName,
            actions: [
                new CloudFormationCreateUpdateStackAction({
                    actionName: 'ServiceUpdate',
                    stackName: serviceStack.stackName,
                    templatePath: this.buildOutput.atPath(`${serviceStack.stackName}.template.json`),
                    adminPermissions: true,
                }),
            ]
        });
    }

    public addBillingStackToStage(billingStack: BillingStack, stage: IStage) {
        stage.addAction(
            new CloudFormationCreateUpdateStackAction({
                actionName: "Billing_Update",
                stackName: billingStack.stackName,
                templatePath: this.buildOutput.atPath(
                    `${billingStack.stackName}.template.json`
                ),
                adminPermissions: true,
            })
        );
    }

    public addServiceIntegrationTestToStage(stage: IStage, serviceEndpoints: ServiceEndpoints) {
        stage.addAction(
            new CodeBuildAction({
                actionName: "Integration_Test",
                input: this.sourceOutput,
                project: new PipelineProject(this, "IntegrationTestProject", {
                    environment: {
                        buildImage: LinuxBuildImage.STANDARD_5_0,
                    },
                    buildSpec: BuildSpec.fromSourceFilename(
                        "infra/build-specs/integration-test-build-spec.yml"
                    ),
                }),
                environmentVariables: {
                    MULTIPLICATION_LAMBDA_URL: {
                        value: serviceEndpoints.multiplicationLambdaUrl,
                        type: BuildEnvironmentVariableType.PLAINTEXT,
                    },
                    ADDITION_LAMBDA_URL: {
                        value: serviceEndpoints.additionLambdaUrl,
                        type: BuildEnvironmentVariableType.PLAINTEXT,
                    },
                    SQUARE_LAMBDA_URL: {
                        value: serviceEndpoints.squareLambdaUrl,
                        type: BuildEnvironmentVariableType.PLAINTEXT,
                    }
                },
                type: CodeBuildActionType.TEST,
                runOrder: 2,
            })
        )
    }
}
