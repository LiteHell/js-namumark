export const wikiParagraphContent: TokenizerSubMethod = function () {
  return this.isEndOfText()
    ? null
    : this.choice([
        "Macro",
        "inlineTextDecorationMarkup",
        "escapeSequence",
        "HyperLinkLike",
        "bracketInlineDecoration",
        "inlineNowikiPre",
        "plainNonNewLineCharacter",
      ]);
};
