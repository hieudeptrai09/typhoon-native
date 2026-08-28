import type { Config } from "jest";
import nextJest from "next/jest.js";

// Reads the SWC transform and the "@/*" alias out of tsconfig.json, so neither is restated here.
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  // Every suite so far covers pure modules with no DOM.
  // Components would need a second project on jest-environment-jsdom.
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

export default createJestConfig(config);
