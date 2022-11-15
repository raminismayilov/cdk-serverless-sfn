import { Construct } from 'constructs';
import {
    aws_lambda as lambda, CfnOutput,
} from 'aws-cdk-lib';
import { LambdaRestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

interface ApplicationAPIProps {
    multiplicationService: lambda.IFunction;
}

export class ApplicationAPI extends Construct {
    public readonly multiplicationApiUrl: CfnOutput;

    constructor(scope: Construct, id: string, props: ApplicationAPIProps) {
        super(scope, id);

        const multiplicationApi = new LambdaRestApi(this, 'PV_Module_API', {
            restApiName: 'PV_Module_API',
            handler: props.multiplicationService,
            proxy: false,
        });

        const multiply = multiplicationApi.root.addResource('multiply');
        multiply.addMethod('POST');

        this.multiplicationApiUrl = new CfnOutput(this, 'MULTIPLICATION_API_URL', {
            value: multiplicationApi.url + multiply.path,
        });
    }
}
