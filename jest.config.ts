import type { Config } from 'jest'

const config: Config = {
  testTimeout: 60000,
  testEnvironment: 'node',
  roots: ['./src'],
  verbose: false,
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 19,
      functions: 26,
      lines: 43,
      statements: 43,
    },
  },
}

export default config
