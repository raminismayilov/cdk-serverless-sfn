import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import { Knex } from 'knex';
import { initializeKnex } from '../../db/knex';

let knex: Knex;

type Module = {
    name: string;
    description: string;
};

type CreateModuleDto = {
    body: Module;
};

const create = async (event: APIGatewayProxyEvent & CreateModuleDto): Promise<APIGatewayProxyResult> => {
    console.log(`Create module event: ${JSON.stringify(event)}`);

    const { name, description } = event.body;

    if (!knex) {
        knex = await initializeKnex();
    }

    const [id] = await knex('modules').insert({ name, description }).returning('id');

    return {
        statusCode: 201,
        body: JSON.stringify(id),
    };
};

export default middy().handler(create as any);
