#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ComputeStack } from '../lib/compute-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { BillingStack } from "../lib/billing-stack";

const app = new cdk.App();

const pipelineStack = new PipelineStack(app, 'PipelineStack', {
    env: { account: '670614417011', region: 'eu-central-1' },
});

const computeStackTest = new ComputeStack(app, 'ComputeStackTest', {
    stageName: 'Test',
    env: { account: '670614417011', region: 'eu-central-1' },
});

const computeStackProd = new ComputeStack(app, 'ComputeStackProd', {
    stageName: 'Prod',
    env: { account: '670614417011', region: 'eu-central-1' },
});

const billingStack = new BillingStack(app, 'BillingStack', {
    budgetAmount: 10,
    emailAddress: 'ismayilov@objectify.sk',
});

const testStage = pipelineStack.addServiceStage(computeStackTest, 'Test');
const productionStage = pipelineStack.addServiceStage(computeStackProd, 'Production');

pipelineStack.addBillingStackToStage(billingStack, productionStage);

