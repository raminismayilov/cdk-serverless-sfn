export default {
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: [
        // 'app/**/tests/*.test.ts',
        'infra/test/*.test.ts'
    ],
    preset: 'ts-jest',
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
}
