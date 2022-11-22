#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/stacks/pipeline';

const env = {
    region: 'eu-central-1',
    account: '670614417011',
};

console.log('env', env);

const app = new cdk.App();

const pipelineStack = new PipelineStack(app, 'PipelineStack', {
    env,
});
