export async function handler(event: any): Promise<any> {
    const { sum } = event;
    const result = sum * sum;
    return {
        statusCode: 200,
        body: JSON.stringify({ result }),
    };
}
