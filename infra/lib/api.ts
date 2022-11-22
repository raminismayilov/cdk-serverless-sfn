import { Construct } from 'constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { LambdaRestApi, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

interface ApiProps {
    moduleService: lambda.IFunction;
    migrationService: lambda.IFunction;
}

export class API extends Construct {
    public readonly api: LambdaRestApi;

    constructor(scope: Construct, id: string, props: ApiProps) {
        super(scope, id);

        const pvccApi = new RestApi(this, 'PVComponentsCatalogueApi', {
            restApiName: 'PVComponentsCatalogueApi',
        });

        const modules = pvccApi.root.addResource('modules');
        modules.addMethod('GET', new LambdaIntegration(props.moduleService));
        modules.addMethod('POST', new LambdaIntegration(props.moduleService));

        const singleModule = modules.addResource('{id}');
        singleModule.addMethod('GET', new LambdaIntegration(props.moduleService));

        const migrate = pvccApi.root.addResource('migrate');
        migrate.addMethod('POST', new LambdaIntegration(props.migrationService));
    }
}
