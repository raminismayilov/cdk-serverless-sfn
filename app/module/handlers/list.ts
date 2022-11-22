import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';

const list = async (event: APIGatewayProxyEvent, context: any): Promise<APIGatewayProxyResult> => {
    console.log(`List modules event: ${JSON.stringify(event)}`);
    const { knex } = context;

    const modules = await knex('modules').select();

    return {
        statusCode: 200,
        body: JSON.stringify({ modules }),
    };
};

export default middy().handler(list as any);
