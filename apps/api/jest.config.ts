/* eslint-disable */
export default {
  preset: '../../jest.preset.cjs',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    '^.+\\.svg$': 'jest-transform-stub',
  },
  collectCoverage: true,
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
};
