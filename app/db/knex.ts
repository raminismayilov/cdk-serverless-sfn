import Knex from 'knex';
import { EnvironmentVariable, getOrFail, getSecretValue } from '../utils/environment';
import { MigrationSource } from "./migration-source";

export const getDbSecrets = async () => {
    const secretResp = await getSecretValue(getOrFail(EnvironmentVariable.DB_SECRET_ARN));

    if (secretResp) {
        const secret = JSON.parse(secretResp);
        return {
            user: secret.username,
            password: secret.password,
            database: secret.dbname,
        };
    }
};

export const initializeKnex = async () => {
    const dbSecrets = await getDbSecrets();

    return Knex({
        client: 'postgres',
        useNullAsDefault: true,
        connection: {
            host: getOrFail(EnvironmentVariable.DB_HOST),
            port: 5432,
            ...dbSecrets,
        },
        migrations: {
            migrationSource: new MigrationSource(),
        },
    });
};
