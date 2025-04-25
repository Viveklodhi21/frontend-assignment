const jestConfig = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jest-fixed-jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!(date-fns|@mui/x-date-pickers|@mui/x-date-pickers-pro)/)",
    "/node_modules/(?!d3-(interpolate|color))",
    "/node_modules/(?!(d3|@nivo)/)", // <-- tell Jest to transform ESM packages
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  setupFilesAfterEnv: [
    "C:UserservivOneDriveDesktopprojects\frontend-assignmentjest.setup.js",
  ],
};

export default jestConfig;
