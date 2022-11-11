import { App, Environment } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { PipelineStack } from "../lib/pipeline-stack";
import * as Pipeline from "../lib/pipeline-stack";

const testEnv = {
    account: "123456789012",
    region: "us-east-1",
}

test('Pipeline Stack', () => {
    // const app = new App();
    //
    // const stack = new Pipeline.PipelineStack(app, "MyTestStack", {
    //     env: testEnv,
    // });
    //
    // expect(Template.fromStack(stack).toJSON()).toMatchSnapshot();
});
