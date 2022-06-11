/**
 * Normalizes "plainText" tokens
 * @param tokens Namumark tokens
 * @returns Normalized namumark tokens
 */
export default function flattenPlainText(
  tokens: NamumarkToken[]
): NamumarkToken[] {
  for (let i = 0; i < tokens.length - 1; ) {
    const nextToken = tokens[i + 1];
    const currentToken = tokens[i];
    if (nextToken.name === "plainText" && currentToken.name === "plainText") {
      currentToken.content += nextToken.content;
      tokens.splice(i + 1, 1);
    } else {
      i++;
    }
  }
  for (const token of tokens) {
    if (
      token.name === "heading" ||
      token.name === "textDecoration" ||
      token.name === "textSize" ||
      token.name === "textColor" ||
      token.name === "pre" ||
      token.name === "link"
    ) {
      token.children = flattenPlainText(token.children);
    }
  }
  return tokens;
}
