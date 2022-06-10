import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: "\\.test\\.ts$",
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  globals: {
    "ts-jest": {
      diagnostics: true,
    },
  },
};
export default config;
