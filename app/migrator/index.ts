import { initializeKnex } from '../db/knex';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

enum MigrationType {
    UP = 'up',
    DOWN = 'down',
    LATEST = 'latest',
}

type MigrationEvent = {
    type: 'up' | 'down' | 'latest';
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { type }: MigrationEvent = JSON.parse(event.body ?? '{}');

    if (!type) throw new Error('No migration type specified');

    if (!Object.values(MigrationType).includes(type as MigrationType)) {
        throw new Error(`Unsupported migration type: ${type}`);
    }

    console.log(`Running ${type} migrations`);

    const knex = await initializeKnex();

    try {
        const res = await knex.migrate[type]();
        console.log(`Successfully ran ${type} migration`, res);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully ran ${type} migration`,
            }),
        }
    } catch (error: unknown) {
        console.error('Failed to run migration');
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to run migration',
            }),
        }
    } finally {
        await knex.destroy();
    }
};