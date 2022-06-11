export const plainNonNewLineCharacter: TokenizerSubMethod = function () {
  const consumed = this.consumeCharacter(/[^\n]/);
  if (consumed) {
    return [
      {
        name: "plainText",
        content: consumed.character,
      },
    ];
  } else {
    return null;
  }
};
