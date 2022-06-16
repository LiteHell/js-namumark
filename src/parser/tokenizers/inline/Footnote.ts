export const Footnote: TokenizerSubMethod = function () {
  const consumed = this.consumeIfRegexMatches(/\[\*/);
  if (consumed) {
    let children: NamumarkToken[] = [];
    let parsingContent = false;
    let footnoteName: string | null = null;
    while (!this.isEndOfText() && this.seekCharacter() !== "\n") {
      if (parsingContent) {
        const closure = this.consumeCharacter(/\]/);
        if (closure) {
          return [
            footnoteName !== null
              ? {
                  name: "footnote",
                  footnoteName,
                  children,
                }
              : {
                  name: "footnote",
                  children,
                },
          ];
        } else {
          const token = this.tryTokenize("wikiParagraphContent");
          if (token) {
            children = children.concat(token);
          } else {
            break;
          }
        }
      } else {
        const whitespace = this.consumeIfRegexMatches(/\s/);
        if (whitespace) {
          parsingContent = true;
        } else {
          if (footnoteName === null) footnoteName = "";
          const ch = this.consumeCharacter();
          if (ch && ch.character === "]")
            return [
              footnoteName === null
                ? { name: "footnote", children: [] }
                : { name: "footnote", footnoteName, children: [] },
            ];
          else if (ch) footnoteName += ch.character;
          else break;
        }
      }
    }
    consumed.rollback();
  }
  return null;
};
