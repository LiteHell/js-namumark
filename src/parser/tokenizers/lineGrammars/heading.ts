import NamumarkParser from "../..";

export const heading: TokenizerSubMethod = function () {
  if (!this.isLineStartNow()) {
    return null;
  }

  for (let i = 0; i < 2; i++) {
    const folded = i % 2 == 0;
    for (let j = 1; j <= 6; j++) {
      let patternText = " (.+?) ";
      if (folded) patternText = "#" + patternText + "#";
      for (let k = 0; k < j; k++) patternText = "=" + patternText + "=";
      patternText = "^" + patternText + "$";

      const lineConsumed = this.consumeIfRegexMatches(patternText);
      if (lineConsumed) {
        const inlineParser = new NamumarkParser(lineConsumed.match[1], true);
        const { result: children } = inlineParser.parse();
        return [
          {
            name: "heading",
            headingLevel: j,
            children,
          },
        ];
      }
    }
  }

  return null;
};
