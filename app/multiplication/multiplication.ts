/**
 *
 * @param event e.g. { a: 1, b: 3 }
 * @returns e.g. { Payload: { product: 3 } }
 */
export async function handler(event: any): Promise<any> {
    const body = JSON.parse(event.body);
    const { a, b } = body;

    const product = a * b;

    return {
        statusCode: 200,
        body: JSON.stringify({ product }),
    };
}
