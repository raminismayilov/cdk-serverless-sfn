#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ComputeStack } from '../lib/stacks/compute';
import { VpcStack } from '../lib/stacks/vpc';
import { DatabaseStack } from '../lib/stacks/database';
import { PipelineStack } from "../lib/stacks/pipeline";

const env = {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
};

const app = new cdk.App();

// const vpcStack = new VpcStack(app, 'VpcStack');
//
// const databaseStack = new DatabaseStack(app, 'DatabaseStack', {
//     vpc: vpcStack.vpc,
// });
//
// const computeStack = new ComputeStack(app, 'ComputeStack', {
//     vpc: vpcStack.vpc,
//     privateSg: databaseStack.privateSg,
//     rdsCredentials: databaseStack.rdsCredentials,
//     rdsProxy: databaseStack.rdsProxy,
// });
//
// databaseStack.addDependency(vpcStack);
// computeStack.addDependency(databaseStack);

const pipelineStack = new PipelineStack(app, 'PipelineStack');
