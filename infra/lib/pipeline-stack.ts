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

export class PipelineStack extends cdk.Stack {
    private readonly pipeline: Pipeline;
    private readonly buildOutput: Artifact;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.pipeline = new Pipeline(this, 'Pipeline', {
            pipelineName: 'MyPipeline',
            crossAccountKeys: false,
            restartExecutionOnUpdate: true,
        });

        const sourceOutput = new Artifact('SourceOutput');

        const sourceAction = new GitHubSourceAction({
            actionName: 'Source',
            owner: 'raminismayilov',
            repo: 'cdk-serverless-sfn',
            branch: 'master',
            oauthToken: cdk.SecretValue.secretsManager('github-token'),
            output: sourceOutput,
        });

        this.pipeline.addStage({
            stageName: 'Source',
            actions: [sourceAction],
        });

        this.buildOutput = new Artifact('BuildOutput');

        const buildAction = new CodeBuildAction({
            actionName: 'PipelineBuild',
            input: sourceOutput,
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

    public addServiceStage(serviceStack: cdk.Stack, stageName: string) {
        this.pipeline.addStage({
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
}
