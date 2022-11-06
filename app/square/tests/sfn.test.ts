import {
    SFNClient,
    StartExecutionCommand,
    StartExecutionCommandInput,
    DescribeExecutionCommand,
    DescribeExecutionCommandInput,
    CreateStateMachineCommand,
    CreateStateMachineCommandInput,
} from '@aws-sdk/client-sfn';
import stateMachineDefinition from '../../../asl-0.json';

describe('simple state machine', () => {
    let sfn: SFNClient;
    let stateMachineArn: string;

    beforeAll(async () => {
        sfn = new SFNClient({
            region: 'eu-central-1',
            endpoint: 'http://localhost:8083',
        });

        const params: CreateStateMachineCommandInput = {
            name: 'SimpleStateMachine',
            definition: JSON.stringify(stateMachineDefinition),
            roleArn: 'arn:aws:iam::123456789012:role/Dummy-eu-central-1',
            type: 'STANDARD',
        };

        const createStateMachineCommandOutput = await sfn.send(new CreateStateMachineCommand(params));
        stateMachineArn = createStateMachineCommandOutput.stateMachineArn!;
    });

    it('should return 144', async () => {
        const input: StartExecutionCommandInput = {
            stateMachineArn,
            input: JSON.stringify({ a: 5, b: 7 }),
        };

        const result = await sfn.send(new StartExecutionCommand(input));
        const executionArn = result.executionArn;

        let describeResult;
        let executionStatus = 'RUNNING';
        while (executionStatus === 'RUNNING') {
            const describeInput: DescribeExecutionCommandInput = {
                executionArn: executionArn!,
            };
            describeResult = await sfn.send(new DescribeExecutionCommand(describeInput));
            executionStatus = describeResult.status!;
        }

        expect(executionStatus).toEqual('SUCCEEDED');
        expect(describeResult?.output).toContain(JSON.stringify({ result: 144 }));
    }, 10000);
});
