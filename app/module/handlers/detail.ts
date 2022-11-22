import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';

const detail = async (
    event: APIGatewayProxyEvent & { pathParameters: { id: string } },
    context: any
): Promise<APIGatewayProxyResult> => {
    console.log(`Detail module event: ${JSON.stringify(event)}`);

    const { id } = event.pathParameters;
    const { knex } = context;

    const module = await knex('modules').where({ id }).first();

    return {
        statusCode: 200,
        body: JSON.stringify({ module }),
    };
};

export default middy().handler(detail as any);
