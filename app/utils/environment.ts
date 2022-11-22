export enum EnvironmentVariable {
    STAGE = 'STAGE',
    DB_HOST = 'DB_HOST',
    DB_USER = 'DB_USER',
    DB_PASSWORD = 'DB_PASSWORD',
    DB_SECRET_ARN = 'DB_SECRET_ARN',
    REGION = 'REGION',
    API_URL = 'API_URL',
}

export const getOrFail = (key: EnvironmentVariable): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing value for environment variable with key ${key}`);
    }
    return value;
};
