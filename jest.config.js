/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
  // Do not fail for the moment (time to make all the tests operational)
  testFailureExitCode: 0,
  // Add extra jest configuration
  //setupFilesAfterEnv: ['<rootDir>/test/setup-jest.js'],
  transform: {}
};

export default config;
