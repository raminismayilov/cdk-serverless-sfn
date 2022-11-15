import { Construct } from 'constructs';
import {
    aws_lambda as lambda,
} from 'aws-cdk-lib';
import { LambdaRestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

interface ApplicationAPIProps {
    multiplicationService: lambda.IFunction;
}

export class ApplicationAPI extends Construct {
    public readonly restApi: LambdaRestApi;

    constructor(scope: Construct, id: string, props: ApplicationAPIProps) {
        super(scope, id);

        const multiplicationApi = new LambdaRestApi(this, 'PV_Module_API', {
            restApiName: 'PV_Module_API',
            handler: props.multiplicationService,
            proxy: false,
        });

        const multiply = multiplicationApi.root.addResource('multiply');
        multiply.addMethod('POST');
    }
}
