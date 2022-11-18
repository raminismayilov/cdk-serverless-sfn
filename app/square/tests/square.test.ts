import {
    SFNClient,
    StartExecutionCommand,
    StartExecutionCommandInput,
    DescribeExecutionCommand,
    DescribeExecutionCommandInput,
    DescribeExecutionCommandOutput,
} from '@aws-sdk/client-sfn';

async function waitForSfnCompletion(sfn: SFNClient, executionArn: string): Promise<DescribeExecutionCommandOutput> {
    const descriptionInput: DescribeExecutionCommandInput = {
        executionArn: executionArn!,
    };
    const descriptionOutput = await sfn.send(new DescribeExecutionCommand(descriptionInput));

    return new Promise((resolve) => {
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

    beforeAll(async () => {
        sfn = new SFNClient({
            region: 'eu-central-1',
        });
    });

    it('should return 144', async () => {
        const input: StartExecutionCommandInput = {
            stateMachineArn: process.env.SIMPLE_STATE_MACHINE_ARN!,
            input: JSON.stringify({ a: 5, b: 7 }),
        };

        const result = await sfn.send(new StartExecutionCommand(input));
        const executionArn = result.executionArn;

        const descriptionOutput: DescribeExecutionCommandOutput = await waitForSfnCompletion(sfn, executionArn!);

        expect(descriptionOutput.status).toEqual('SUCCEEDED');
        expect(descriptionOutput.output).toContain(JSON.stringify({ result: 144 }));
    }, 20000);
});