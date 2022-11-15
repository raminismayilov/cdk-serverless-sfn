const axios = require('axios');

describe('multiplication', () => {
    it('should return 3', async () => {
        const response = await axios.post(process.env.MULTIPLICATION_API_URL, {
            a: 1,
            b: 3,
        });
        expect(response.data).toEqual({ product: 3 });
    }, 10000);
});
