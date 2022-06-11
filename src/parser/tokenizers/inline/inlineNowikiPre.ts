export const inlineNowikiPre: TokenizerSubMethod = function() {
    const consumed = this.consumeIfRegexMatches(/\{\{\{/);
    if (consumed) {
      const { rollback } = consumed;
      let content = "";
      while (!this.isEndOfText() && this.seekCharacter() !== "\n") {
        const closure = this.consumeIfRegexMatches(/\}\}\}/);
        if (closure) {
          return [
            {
              name: "pre",
              inline: true,
              children: [
                {
                  name: "plainText",
                  content,
                },
              ],
            },
          ];
        } else {
          const ch = this.consumeCharacter();
          if (ch) content += ch.character;
          else {
            rollback();
            return null;
          }
        }
      }
      rollback();
      return null;
    } else {
      return null;
    }
  }