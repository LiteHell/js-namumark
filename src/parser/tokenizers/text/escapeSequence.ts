export const escapeSequence: TokenizerSubMethod = function () {
  const consumed = this.consumeIfRegexMatches(/\/([^/])/);
  if (consumed) {
    return [
      {
        name: "plainText",
        content: consumed.match[1],
      },
    ];
  } else {
    return null;
  }
};
