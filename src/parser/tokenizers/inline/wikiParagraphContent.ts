export const wikiParagraphContent: TokenizerSubMethod = function () {
  return this.isEndOfText()
    ? null
    : this.choice([
        "inlineTextDecorationMarkup",
        "escapeSequence",
        "HyperLinkLike",
        "bracketInlineDecoration",
        "inlineNowikiPre",
        "plainNonNewLineCharacter",
      ]);
};
