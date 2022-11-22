import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

const secretsManagerClient = new SecretsManagerClient({
    region: 'eu-central-1',
});

export enum EnvironmentVariable {
    STAGE = 'STAGE',
    DB_HOST = 'DB_HOST',
    DB_USER = 'DB_USER',
    DB_PASSWORD = 'DB_PASSWORD',
    DB_SECRET_ARN = 'DB_SECRET_ARN',
    REGION = 'REGION',
}

export const getOrFail = (key: EnvironmentVariable): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing value for environment variable with key ${key}`);
    }
    return value;
};


export const getSecretValue = async (secretId: string) => {
    const params = {
        SecretId: secretId,
    };
    const data = await secretsManagerClient.send(new GetSecretValueCommand(params));
    if ('SecretString' in data) {
        return data.SecretString;
    } else {
        const buff = new Buffer(data.SecretBinary as any, "base64");
        return  buff.toString('ascii');
    }
}
