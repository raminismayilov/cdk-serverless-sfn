/**
 *
 * @param event e.g. { a: 1, b: 2 }
 * @returns e.g. { Payload: { sum: 2 } }
 */
export async function handler(event: any): Promise<any> {
    const { a, b } = event;
    const sum = a + b;
    return { sum };
}
