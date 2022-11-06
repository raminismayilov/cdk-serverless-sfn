import { Lambda, InvokeCommandInput } from '@aws-sdk/client-lambda';
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node';

describe('square', () => {
    let lambda: Lambda;

    beforeAll(() => {
        lambda = new Lambda({
            region: 'eu-central-1',
            endpoint: 'http://127.0.0.1:3001',
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

        const { body } = JSON.parse(toUtf8(result.Payload!));
        expect(body).toEqual(JSON.stringify({ result: 16 }));
    });
});
