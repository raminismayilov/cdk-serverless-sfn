export async function handler(event: any): Promise<any> {
    const { a, b } = event;
    const result = a + b;
    return {
        statusCode: 200,
        body: JSON.stringify({ result }),
    }
}
