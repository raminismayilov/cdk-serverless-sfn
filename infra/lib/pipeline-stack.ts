import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Artifact, IStage, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import {
    CloudFormationCreateUpdateStackAction,
    CodeBuildAction,
    CodeBuildActionType,
    GitHubSourceAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import {
    BuildEnvironmentVariableType,
    BuildSpec,
    LinuxBuildImage,
    PipelineProject,
} from "aws-cdk-lib/aws-codebuild";

export class PipelineStack extends cdk.Stack {
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

        const buildOutput = new Artifact('BuildOutput');

        const buildAction = new CodeBuildAction({
            actionName: "PipelineBuild",
            input: sourceOutput,
            outputs: [buildOutput],
            project: new PipelineProject(this, "BuildProject", {
                environment: {
                    buildImage: LinuxBuildImage.STANDARD_5_0,
                },
                buildSpec: BuildSpec.fromSourceFilename(
                    "infra/build-specs/build-spec.yml"
                ),
            }),
        });

        pipeline.addStage({
            stageName: "Build",
            actions: [
                buildAction,
            ],
        });
    }
}
