export default {
  testEnvironment: 'node',
  // Only pick up ESM tests we add (.mjs) so legacy CJS placeholders don't run
  testMatch: ['**/tests/**/*.test.mjs'],
  verbose: true
};