import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import { Knex } from 'knex';
import { initializeKnex } from '../../db/knex';

let knex: Knex;

const list = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!knex) {
        knex = await initializeKnex();
    }

    const modules = await knex('modules').select();

    return {
        statusCode: 200,
        body: JSON.stringify({ modules }),
    };
};

export default middy().handler(list as any);
