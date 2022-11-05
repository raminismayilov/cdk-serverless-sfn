export default {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    preset: 'ts-jest',
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
}
