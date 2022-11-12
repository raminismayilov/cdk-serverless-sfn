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
    private readonly infrastructureBuildOutput: Artifact;
    private readonly serviceBuildOutput: Artifact;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const pipeline = new Pipeline(this, 'Pipeline', {
            pipelineName: 'MyPipeline',
            crossAccountKeys: false,
        });

        const sourceOutput = new Artifact('SourceOutput');

        const sourceAction = new GitHubSourceAction({
            actionName: 'PipelineSource',
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

        this.infrastructureBuildOutput = new Artifact('InfrastructureBuildOutput');
        this.serviceBuildOutput = new Artifact('ServiceBuildOutput');

        const infrastructureBuildAction = new CodeBuildAction({
            actionName: 'PipelineBuild',
            input: sourceOutput,
            outputs: [this.infrastructureBuildOutput],
            project: new PipelineProject(this, 'InfrastructureBuildProject', {
                environment: {
                    buildImage: LinuxBuildImage.STANDARD_5_0,
                },
                buildSpec: BuildSpec.fromSourceFilename('infra/build-specs/infra-build-spec.yml'),
            }),
        });

        const serviceBuildAction = new CodeBuildAction({
            actionName: 'ServiceBuild',
            input: sourceOutput,
            outputs: [this.serviceBuildOutput],
            project: new PipelineProject(this, 'ServiceBuildProject', {
                environment: {
                    buildImage: LinuxBuildImage.STANDARD_5_0,
                },
                buildSpec: BuildSpec.fromSourceFilename('infra/build-specs/service-build-spec.yml'),
            }),
        });

        pipeline.addStage({
            stageName: 'Build',
            actions: [infrastructureBuildAction, serviceBuildAction],
        });

        const pipelineUpdateAction = new CloudFormationCreateUpdateStackAction({
            actionName: 'PipelineUpdate',
            stackName: 'PipelineStack',
            templatePath: this.infrastructureBuildOutput.atPath('PipelineStack.template.json'),
            adminPermissions: true,
        });

        pipeline.addStage({
            stageName: 'Pipeline_Update',
            actions: [pipelineUpdateAction],
        });
    }
}
