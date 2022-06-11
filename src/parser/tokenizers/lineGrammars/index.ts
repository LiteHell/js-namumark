export * from "./heading";
export * from "./horizontalLine";
export const lineGrammar: TokenizerSubMethod = function () {
  const rollback = this.createPosRollbacker();
  this.tryTokenize("newLine");
  const result = this.choice(["heading", "horizontalLine"]);
  if (result === null) {
    rollback();
    return null;
  }
  this.tryTokenize("newLine");
  return result;
};
