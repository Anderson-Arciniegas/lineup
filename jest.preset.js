const nxPreset = require('@nx/jest/preset').default;

/** Shared coverage gates for all Jest projects (meta ≥80% en las 4 facetas). */
const coverageThreshold = {
  global: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
  },
};

module.exports = {
  ...nxPreset,
  coverageThreshold,
};
