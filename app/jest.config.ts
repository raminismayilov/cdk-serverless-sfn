export default {
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: [
        '**/tests/*.test.ts',
    ],
    preset: 'ts-jest',
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
}
