import { aws_lambda as lambda, aws_logs as logs } from 'aws-cdk-lib';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

type NodejsServiceFunctionProps = NodejsFunctionProps;

export class NodejsServiceFunction extends NodejsFunction {
    constructor(scope: Construct, id: string, props: NodejsServiceFunctionProps) {
        const runtime = props.runtime ?? lambda.Runtime.NODEJS_16_X;
        const handler = 'handler';
        const logRetention = logs.RetentionDays.THREE_DAYS;
        const bundling = {
            ...props.bundling,
            minify: true,
            externalModules: [...(props.bundling?.externalModules ?? []), 'aws-sdk'],
        };
        const tracing = lambda.Tracing.ACTIVE;

        super(scope, id, {
            ...props,
            runtime,
            handler,
            logRetention,
            tracing,
            bundling,
        });
    }
}
