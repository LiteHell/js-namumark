export const wikiParagraphContent: TokenizerSubMethod = function () {
  return this.isEndOfText()
    ? null
    : this.choice([
        "Macro",
        "inlineTextDecorationMarkup",
        "Footnote",
        "escapeSequence",
        "HyperLinkLike",
        "bracketInlineDecoration",
        "inlineNowikiPre",
        "plainNonNewLineCharacter",
      ]);
};
