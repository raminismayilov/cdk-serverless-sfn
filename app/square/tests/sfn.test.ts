import {
    SFNClient,
    StartExecutionCommand,
    StartExecutionCommandInput,
    DescribeExecutionCommand,
    DescribeExecutionCommandInput,
    DescribeExecutionCommandOutput,
    CreateStateMachineCommand,
    CreateStateMachineCommandInput,
} from '@aws-sdk/client-sfn';
import stateMachineDefinition from '../../../asl-0.json';

async function waitForSfnCompletion(sfn: SFNClient, executionArn: string): Promise<DescribeExecutionCommandOutput> {
    const descriptionInput: DescribeExecutionCommandInput = {
        executionArn: executionArn!,
    };
    const descriptionOutput = await sfn.send(new DescribeExecutionCommand(descriptionInput));

    return new Promise((resolve) => {
        console.log('descriptionOutput', descriptionOutput);
        if (descriptionOutput.status === 'SUCCEEDED') {
            resolve(descriptionOutput);
        } else {
            setTimeout(() => {
                resolve(waitForSfnCompletion(sfn, executionArn));
            }, 1000);
        }
    })
}

describe('simple state machine', () => {
    let sfn: SFNClient;
    let stateMachineArn: string;

    beforeAll(async () => {
        sfn = new SFNClient({
            region: 'eu-central-1',
            endpoint: 'http://localhost:8083',
            credentials: {
                accessKeyId: 'test',
                secretAccessKey: 'test',
            }
        });

        const params: CreateStateMachineCommandInput = {
            name: 'SimpleStateMachine',
            definition: JSON.stringify(stateMachineDefinition),
            roleArn: 'arn:aws:iam::123456789012:role/Dummy-eu-central-1',
            type: 'STANDARD',
        };

        const createStateMachineCommandOutput = await sfn.send(new CreateStateMachineCommand(params));
        stateMachineArn = createStateMachineCommandOutput.stateMachineArn!;

        console.log('stateMachineArn', stateMachineArn);
    });

    afterAll(async () => {
        await sfn.destroy();
    });

    it('should return 144', async () => {
        console.log('Test starts');
        const input: StartExecutionCommandInput = {
            stateMachineArn,
            input: JSON.stringify({ a: 5, b: 7 }),
        };

        const result = await sfn.send(new StartExecutionCommand(input));
        console.log('Execution started');
        const executionArn = result.executionArn;

        const descriptionOutput: DescribeExecutionCommandOutput = await waitForSfnCompletion(sfn, executionArn!);
        console.log('Execution completed');

        expect(descriptionOutput.status).toEqual('SUCCEEDED');
        expect(descriptionOutput.output).toContain(JSON.stringify({ result: 144 }));
    }, 20000);
});
