export default {
    testEnvironment: 'node',
    roots: ['<rootDir>/app/'],
    testMatch: ['**/tests/*.test.ts'],
    preset: 'ts-jest',
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
}
