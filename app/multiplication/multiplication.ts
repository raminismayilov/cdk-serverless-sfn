/**
 *
 * @param event e.g. { a: 1, b: 3 }
 * @returns e.g. { Payload: { product: 3 } }
 */
export async function handler(event: any): Promise<any> {
    const { a, b } = event;
    const product = a * b;
    return { product };
}
