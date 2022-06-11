export const horizontalLine: TokenizerSubMethod = function () {
    if (!this.isLineStartNow()) {
      return null;
    }

    const lineConsumed = this.consumeIfRegexMatches(/^-{4,9}$/);
    if (lineConsumed) {
      return [
        {
          name: "horizontalLine",
        },
      ];
    } else {
      return null;
    }
  }