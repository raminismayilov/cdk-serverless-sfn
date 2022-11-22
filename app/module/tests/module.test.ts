import { EnvironmentVariable, getOrFail } from '../../utils/environment';
import axios from 'axios';
import { initializeKnex } from '../../db/knex';
import { Knex } from 'knex';

describe('CRUD operations on modules', () => {
    let knex: Knex;
    let MODULES_API_URL: string;

    beforeAll(async () => {
        MODULES_API_URL = `https://ph4j4o6cu0.execute-api.eu-central-1.amazonaws.com/prod/modules`;
        //
        // knex = await initializeKnex();
        // await knex('modules').del();
        const dbRegion = getOrFail(EnvironmentVariable.REGION);
    });

    it('should create a module', async () => {
        const response = await axios.post(MODULES_API_URL, {
            name: 'Test Module',
            description: 'Test Description',
        });

        expect(response.status).toBe(201);
    });

    it('should list modules', async () => {
        for (let i = 0; i < 5; i++) {
            await axios.post(MODULES_API_URL, {
                name: 'Test Module',
                description: 'Test Description',
            });
        }

        const response = await axios.get(MODULES_API_URL);
        expect(response.status).toBe(200);
        expect(response.data.body).toBe(5);
    });
});
