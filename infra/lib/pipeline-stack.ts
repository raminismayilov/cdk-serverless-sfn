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
    private readonly buildOutput: Artifact;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const pipeline = new Pipeline(this, 'Pipeline', {
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

        pipeline.addStage({
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

        pipeline.addStage({
            stageName: 'Build',
            actions: [buildAction],
        });

        const pipelineUpdateAction = new CloudFormationCreateUpdateStackAction({
            actionName: 'PipelineUpdate',
            stackName: 'PipelineStack',
            templatePath: this.buildOutput.atPath('PipelineStack.template.json'),
            adminPermissions: true,
        });

        pipeline.addStage({
            stageName: 'Pipeline_Update',
            actions: [pipelineUpdateAction],
        });
    }
}
