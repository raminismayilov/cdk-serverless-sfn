import { Lambda, InvokeCommandInput, InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node';

describe('multiplication', () => {
    let lambda: LambdaClient;

    beforeAll(() => {
        lambda = new LambdaClient({
            region: "eu-central-1",
            credentials: {
                accessKeyId: "",
                secretAccessKey: ""
            }
        });
    });

    it('should return 3', async () => {
        const command = new InvokeCommand({
            FunctionName: 'Test-multiplication',
            InvocationType: 'RequestResponse',
            Payload: fromUtf8(JSON.stringify({a: 1, b: 3} )),
        });

        let result
        try {
            result = await lambda.send(command);
        } catch (e) {
            console.log(e);
        }

        expect(result?.StatusCode).toEqual(200);
        expect(JSON.parse(toUtf8(result?.Payload!))).toEqual({ product: 3 });
        console.log(JSON.parse(toUtf8(result?.Payload!)))
    }, 10000);
});
