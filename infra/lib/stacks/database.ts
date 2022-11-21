import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface DatabaseStackProps extends StackProps {}

export class DatabaseStack extends Stack {
    constructor(scope: Construct, id: string, props: DatabaseStackProps) {
        super(scope, id, props);
    }
}
