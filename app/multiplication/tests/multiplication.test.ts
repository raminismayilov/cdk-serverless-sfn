import { Lambda, InvokeCommandInput } from '@aws-sdk/client-lambda';
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node';

describe('multiplication', () => {
    let lambda: Lambda;

    beforeAll(() => {
        lambda = new Lambda({
            region: 'eu-central-1',
            endpoint: process.env.MULTIPLICATION_LAMBDA_URL,
            runtime: 'nodejs16.x',
            credentials: {
                accessKeyId: 'test',
                secretAccessKey: 'test',
            },
        });
    });

    it('should return 3', async () => {
        const params: InvokeCommandInput = {
            FunctionName: 'Multiplication',
            InvocationType: 'RequestResponse',
            Payload: fromUtf8(JSON.stringify({a: 1, b: 3})),
        };

        const result = await lambda.invoke(params);

        expect(result.StatusCode).toEqual(200);
        expect(JSON.parse(toUtf8(result.Payload!))).toEqual({ product: 3 });
    }, 10000);
});
