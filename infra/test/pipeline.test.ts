import { App, Environment } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { PipelineStack } from '../lib/pipeline-stack';
import { ComputeStack } from '../lib/compute-stack';

const testEnv = {
    account: '123456789012',
    region: 'us-east-1',
};

test('Pipeline Stack', () => {
    const app = new App();

    const stack = new PipelineStack(app, 'MyTestStack', {
        env: testEnv,
    });

    expect(Template.fromStack(stack).toJSON()).toMatchSnapshot();
});

test('Adding service stage', () => {
    const app = new App();
    const computeStack = new ComputeStack(app, 'ComputeStack');
    const pipelineStack = new PipelineStack(app, 'PipelineStack');

    pipelineStack.addServiceStage(computeStack, 'Test');

    Template.fromStack(pipelineStack).hasResourceProperties('AWS::CodePipeline::Pipeline', {
        Stages: Match.arrayWith([
            Match.objectLike({
                Name: 'Test',
            }),
        ]),
    });
});
