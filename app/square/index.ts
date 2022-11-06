/**
 *
 * @param event e.g. { sum: 2 }
 * @returns e.g. { Payload: { result: 4 } }
 */
export async function handler(event: any): Promise<any> {
    const { sum } = event;
    const result = sum * sum;
    return { result };
}
