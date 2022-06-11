export * from "./heading";
export * from "./horizontalLine";
export const lineGrammar: TokenizerSubMethod = function () {
  return this.choice(["heading", "horizontalLine"]);
};
