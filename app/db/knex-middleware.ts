import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { initializeKnex } from './knex';

const knexMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
    const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
        request
    ): Promise<void> => {
        const knex = await initializeKnex();

        knex.raw('SELECT 1').catch((err) => {
            console.error(err);
            throw err;
        });

        Object.assign(request.context, { knex: await knex });
    };

    const after: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
        request
    ): Promise<void> => {
        await request.context['knex'].destroy();
    };

    return {
        before,
        after,
    };
};

export default knexMiddleware;
