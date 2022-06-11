export const newLine: TokenizerSubMethod = function () {
  const consumed = this.consumeCharacter("\n");
  if (consumed) {
    return [{ name: "newLine" }];
  } else {
    return null;
  }
};
