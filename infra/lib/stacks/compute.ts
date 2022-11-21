import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Services } from "../services";
import { API } from "../api";

export class ComputeStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const services = new Services(this, 'Services');

        const api = new API(this, 'Pv', {
            moduleService: services.moduleService,
        });
    }
}