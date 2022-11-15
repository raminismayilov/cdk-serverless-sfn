import { App, Environment } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { PipelineStack } from '../lib/stacks/pipeline-stack';
import { ComputeStack } from '../lib/stacks/compute-stack';
import { BillingStack } from '../lib/stacks/billing-stack';

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
