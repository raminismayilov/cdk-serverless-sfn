export default {
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: [
        '**/app/multiplication/tests/*.test.ts',
    ],
    preset: 'ts-jest',
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
}
