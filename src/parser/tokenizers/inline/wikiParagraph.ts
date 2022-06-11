export const wikiParagraph: TokenizerSubMethod = function () {
  let tokens: NamumarkToken[] | null = null;
  while (!this.isEndOfText()) {
    const result = this.tryTokenize("wikiParagraphContent");

    if (result) {
      tokens = (tokens === null ? ([] as NamumarkToken[]) : tokens).concat(
        result
      );
    } else {
      break;
    }
  }
  this.state.inlineMarkups = [];
  return tokens;
};
