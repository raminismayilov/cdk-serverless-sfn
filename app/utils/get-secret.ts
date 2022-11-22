import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { EnvironmentVariable, getOrFail } from "./environment";

const secretsManagerClient = new SecretsManagerClient({
    region: getOrFail(EnvironmentVariable.REGION),
});

export const getSecretValue = async (secretId: string) => {
    const params = {
        SecretId: secretId,
    };
    const data = await secretsManagerClient.send(new GetSecretValueCommand(params));
    if ('SecretString' in data) {
        return data.SecretString;
    } else {
        const buff = new Buffer(data.SecretBinary as any, 'base64');
        return buff.toString('ascii');
    }
};
