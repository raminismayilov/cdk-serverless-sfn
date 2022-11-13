import { Lambda, InvokeCommandInput } from '@aws-sdk/client-lambda';
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node';

describe('square', () => {
    let lambda: Lambda;

    beforeAll(() => {
        lambda = new Lambda({
            region: 'eu-central-1',
            endpoint: process.env.SQUARE_LAMBDA_URL,
            runtime: 'nodejs16.x',
            credentials: {
                accessKeyId: 'test',
                secretAccessKey: 'test',
            }
        });
    });

    it('should return 16', async () => {
        const params: InvokeCommandInput = {
            FunctionName: 'Square',
            InvocationType: 'RequestResponse',
            Payload: fromUtf8(JSON.stringify({ sum: 4 })),
        };

        const result = await lambda.invoke(params);

        expect(result.StatusCode).toEqual(200);
        expect(JSON.parse(toUtf8(result.Payload!))).toEqual({ result: 16 });
    });
});
