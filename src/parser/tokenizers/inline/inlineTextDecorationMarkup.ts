export const inlineTextDecorationMarkup: TokenizerSubMethod = function () {
  const markups = ["'''''", "'''", "''", "__", "~~", "--", "\\^\\^", ",,"];
  for (const markup of markups) {
    // Try to consume text decoration start markup
    const consumed = this.consumeIfRegexMatches(
      markup,
      markup === "'''" ? "'''''" : markup === "''" ? /'''('')?/ : null
    );
    if (consumed) {
      // Text decoration started
      // Create position rollback
      const { rollback } = consumed;

      // If it wasn't start markup, render it as plain text.
      // ignoring(returning null) makes a bug that "'''" becomes "'" (plaintext) + "''" (markup) under certain conditions
      if (this.state.inlineMarkups.includes(markup)) {
        return [
          {
            name: "plainText",
            content: consumed.match[0],
          },
        ];
      }

      // Push current text decoration, parser is currently working on, into the stack
      // For FIFO enforcement
      this.state.inlineMarkups.push(markup);

      // Inner content of text deocration
      let innerTokens: NamumarkToken[] = [];

      // Loop while newline or eot
      while (!this.isEndOfText() && this.seekCharacter() !== "\n") {
        // Get end markups
        const endMarkups = markups.filter((i) =>
          this.state.inlineMarkups.includes(i)
        );
        let markupEndConsumed = null,
          endedMarkup = null;

        // Test for all end markups
        for (const endMarkup of endMarkups) {
          markupEndConsumed = this.consumeIfRegexMatches(endMarkup);
          if (markupEndConsumed) {
            endedMarkup = endMarkup;
            break;
          }
        }

        // When a end markup consumed
        if (markupEndConsumed && endedMarkup) {
          if (endedMarkup === markup) {
            // Good
            const indexOfEndedMarkup =
              this.state.inlineMarkups.lastIndexOf(endedMarkup);
            this.state.inlineMarkups.splice(
              indexOfEndedMarkup,
              this.state.inlineMarkups.length - indexOfEndedMarkup
            );
            return [
              {
                name: "textDecoration",
                markupType: markup === "\\^\\^" ? "^^" : markup,
                children: innerTokens,
              },
            ];
          } else {
            // Not my problem, ignore it.
            rollback();
            return null;
          }
        } else {
          const innerTokensTokenized = this.tryTokenize("wikiParagraphContent");
          if (innerTokensTokenized)
            innerTokens = innerTokens.concat(innerTokensTokenized);
          else if (innerTokens.length !== 0) break;
        }
      }
      rollback();
    }
  }

  return null;
};
