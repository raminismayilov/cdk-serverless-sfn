#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ComputeStack } from '../lib/stacks/compute-stack';
import { PipelineStack } from '../lib/stacks/pipeline-stack';
import { BillingStack } from "../lib/stacks/billing-stack";

const app = new cdk.App();

const pipelineStack = new PipelineStack(app, 'PipelineStack', {
    env: { account: '670614417011', region: 'eu-central-1' },
});
