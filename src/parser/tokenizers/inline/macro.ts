export const Macro: TokenizerSubMethod = function () {
  const escapedMacroNames = this.getMacroNames().map((i) =>
    i.replace(/[^A-Za-z0-9_]/g, "\\$&")
  );
  const starterPattern = `\\[(${escapedMacroNames.join("|")})`;
  const consumed = this.consumeIfRegexMatches(starterPattern);
  if (consumed) {
    const macroName = consumed.match[1];
    if (this.seekCharacter() === "]") {
      // no options
      this.consumeCharacter();
      return [{ name: "macro", macroName }];
    } else if (this.seekCharacter() === "(") {
      this.consumeCharacter(); // consume "("
      // with options
      let options = "";
      while (!this.isEndOfText() && this.seekCharacter() !== "\n") {
        const escapeSequence = this.tryTokenize("escapeSequence");
        if (escapeSequence && escapeSequence[0].name === "plainText") {
          // append options string
          options += escapeSequence[0].content;
        } else {
          if (this.consumeIfRegexMatches(/\)\]/)) {
            // options closed
            return [
              {
                name: "macro",
                macroName,
                options,
              },
            ];
          } else {
            // append options string
            const character = this.consumeCharacter();
            if (character) {
              options += character.character;
            }
          }
        }
      }
    }
    // not macro
    consumed.rollback();
  }
  return null;
};
