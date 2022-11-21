#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ComputeStack } from '../lib/stacks/compute';

const app = new cdk.App();

const computeStack = new ComputeStack(app, 'ComputeStack', {
    env: { account: '670614417011', region: 'eu-central-1' },
});
