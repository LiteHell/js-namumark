import colornames from "colornames";

export const bracketInlineDecoration: TokenizerSubMethod = function () {
  const htmlColors = colornames
    .all()
    .filter((i) => i.css)
    .map((i) => i.name);
  const colorPattern =
    "#(([a-zA-Z0-9]{3}){1,2}|" +
    htmlColors
      .map((color) => {
        let caseInsensitive = "";
        for (let i = 0; i < color.length; i++) {
          if (/([a-zA-Z])/.test(color[i])) {
            caseInsensitive += `[${color[i].toLowerCase()}${color[
              i
            ].toUpperCase()}]`;
          } else {
            caseInsensitive += color[i];
          }
        }
        return caseInsensitive;
      })
      .join("|") +
    ")";
  const consumed = this.consumeIfRegexMatches(
    "\\{\\{\\{(([\\+-][1-5])|" + colorPattern + ") "
  );

  if (consumed) {
    let children: NamumarkToken[] = [];
    while (!this.isEndOfText() && this.seekCharacter() !== "\n") {
      const closure = this.consumeIfRegexMatches(/\}\}\}/);
      if (closure) {
        const isTextSizeSyntax = !consumed.match[1].startsWith("#");
        let result: NamumarkToken | undefined;
        if (isTextSizeSyntax) {
          result = {
            name: "textSize",
            level: parseInt(consumed.match[1]) as NamumarkTextSizeLevel,
            children,
          };
        } else {
          const colorname = colornames.get(consumed.match[1].substring(1));
          result = {
            name: "textColor",
            color: (colorname
              ? colorname.value
              : consumed.match[1]
            ).toUpperCase(), // Normalizes to upper case
            children,
          };
        }
        return [result];
      } else {
        const innerChild = this.tryTokenize("wikiParagraphContent");
        if (innerChild) {
          children = children.concat(innerChild);
        }
      }
    }
    consumed.rollback();
    return null;
  }

  return null;
};
