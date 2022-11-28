import * as path from 'path';
import axios from 'axios';
import { EnvironmentVariable, getOrFail } from '../../utils/environment';
import { initializeKnex } from '../../db/knex';
import { Knex } from 'knex';

describe('CRUD operations on modules', () => {
    let knex: Knex;
    let MODULES_API_URL: string;

    beforeAll(async () => {
        MODULES_API_URL = path.join(getOrFail(EnvironmentVariable.API_URL), 'modules');

        // knex = await initializeKnex();
        // await knex('modules').del();
    });

    it('should create a module', async () => {
        let response
        try {
            response = await axios.post(MODULES_API_URL, {
                name: 'Test Module',
                description: 'Test Description',
            });
        } catch(err) {
            console.error(err);
        }

        expect(response?.status).toBe(201);
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
    });
});
