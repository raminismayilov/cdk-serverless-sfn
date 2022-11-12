#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ComputeStack } from '../lib/compute-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

const pipelineStack = new PipelineStack(app, 'PipelineStack', {
    env: { account: '670614417011', region: 'eu-central-1' },
});

const applicationStack = new ComputeStack(app, 'ComputeStack', {
    env: { account: '670614417011', region: 'eu-central-1' },
});

pipelineStack.addServiceStage(applicationStack, 'Production');
