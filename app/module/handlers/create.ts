import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';

const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Create module' }),
    };
};

export default middy().handler(create as any);
