import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';

type Module = {
    name: string;
    description: string;
};

type CreateModuleDto = {
    body: Module;
};

const create = async (event: APIGatewayProxyEvent & CreateModuleDto, context: any): Promise<APIGatewayProxyResult> => {
    console.log(`Create module event: ${JSON.stringify(event)}`);

    const { name, description } = event.body;
    const { knex } = context;

    const [id] = await knex('modules').insert({ name, description }).returning('id');

    return {
        statusCode: 201,
        body: JSON.stringify(id),
    };
};

export default middy().handler(create as any);
