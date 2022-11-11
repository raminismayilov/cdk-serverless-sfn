#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';
import { PipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();
new InfraStack(app, 'InfraStack', {
    env: {account: '670614417011', region: 'eu-central-1'},
});

new PipelineStack(app, 'PipelineStack', {
    env: {account: '670614417011', region: 'eu-central-1'},
});