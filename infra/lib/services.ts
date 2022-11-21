import * as path from 'path';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { NodejsServiceFunction } from './constructs/service';

interface ServicesProps {}

export class Services extends Construct {
    public readonly moduleService: NodejsFunction;

    constructor(scope: Construct, id: string, props?: ServicesProps) {
        super(scope, id);

        const nodeModules = ['knex', 'pg'];
        const serviceProps = {
            bundling: {
                nodeModules,
            },
        };

        this.moduleService = new NodejsServiceFunction(this, 'ModuleCrudLambda', {
            ...serviceProps,
            entry: path.join(__dirname, '..', '..', 'app', 'module', 'index.ts'),
            functionName: 'ModuleCrudLambda',
        });
    }
}
