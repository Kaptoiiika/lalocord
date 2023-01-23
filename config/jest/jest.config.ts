import path from "path"

export default {
  preset: "ts-jest",

  clearMocks: true,
  testEnvironment: "jsdom",

  coveragePathIgnorePatterns: ["\\\\node_modules\\\\"],

  moduleDirectories: ["node_modules"],

  moduleFileExtensions: [
    "js",
    "mjs",
    "cjs",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node",
  ],

  rootDir: "../..",
  modulePaths: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>//config/jest/setupTests.ts"],

  testMatch: ["<rootDir>/src/**/*(*.)@(spec|test).[tj]s?(x)"],

  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "\\.svg": path.resolve(__dirname, "jestEmptyComponent.tsx"),
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
    path.resolve(__dirname, "fileMock.ts"),
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "<rootDir>/reports/unit",
        filename: "UnitReport.html",
        openReport: true,
        inlineSource: true,
      },
    ],
  ],
}
