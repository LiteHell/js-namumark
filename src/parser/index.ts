import colornames from "colornames";
import deepClone from "./utils/deepClone";
import flattenPlainText from "./utils/flattenPlainText";

/**
 * Namumark parser for tokenizing purpose
 */
export default class NamumarkParser {
  private wikitext: string;
  private parseInlineOnly: boolean;
  private pos: number;
  private inlineMarkups: string[] = [];

  /**
   * Initializes NamumarkParser
   * @param wikitext Wikitext to parse
   */
  constructor(wikitext: string, parseInlineOnly = false) {
    this.wikitext = wikitext;
    this.parseInlineOnly = parseInlineOnly;
    this.pos = 0;

    // bind all functions
    this.lineGrammars = this.lineGrammars.bind(this);
    this.headingGrammar = this.headingGrammar.bind(this);
    this.escapeSequence = this.escapeSequence.bind(this);
    this.plainNonNewLineCharacter = this.plainNonNewLineCharacter.bind(this);
    this.wikiParagraph = this.wikiParagraph.bind(this);
    this.isEndOfText = this.isEndOfText.bind(this);
    this.choice = this.choice.bind(this);
    this.inlineTextDecorationMarkup =
      this.inlineTextDecorationMarkup.bind(this);
    this.seekCharacter = this.seekCharacter.bind(this);
    this.consumeCharacter = this.consumeCharacter.bind(this);
    this.createPosRollbacker = this.createPosRollbacker.bind(this);
    this.isLineStartNow = this.isLineStartNow.bind(this);
    this.consumeIfRegex = this.consumeIfRegex.bind(this);
    this.newLine = this.newLine.bind(this);
    this.wikiParagraphContent = this.wikiParagraphContent.bind(this);
    this.horizontalLine = this.horizontalLine.bind(this);
    this.inlineNowikiPre = this.inlineNowikiPre.bind(this);
    this.bracketInlineDecoration = this.bracketInlineDecoration.bind(this);
  }

  /**
   * Parses namumark wikitext and returns tokens
   * @returns Parsed tokens
   */
  parse(): NamumarkParserResult {
    // Tests redirect and returns redirect target token if it is.
    const redirectTarget = this.redirect(this.wikitext);
    if (redirectTarget) {
      return {
        redirect: true,
        result: [
          {
            name: "redirect",
            redirectTarget,
          },
        ],
      };
    }

    /**
     * Parse order
     *  1. Block wiki grammar (e.g. Table)
     *  2. Line wiki grammar (e.g. Heading)
     *  3. Inline Wiki Paragraph (e.g. Text decorations)
     */
    let tokens: NamumarkToken[] = [];
    const lineGrammarTokenNames: NamumarkTokenName[] = [
      "heading",
      "horizontalLine",
    ];
    const tokenizers = this.parseInlineOnly
      ? [this.escapeSequence, this.wikiParagraph]
      : [
          this.escapeSequence,
          this.lineGrammars,
          this.wikiParagraph,
          this.newLine,
        ];
    while (!this.isEndOfText()) {
      for (const tokenizer of tokenizers) {
        const token = tokenizer();
        if (
          token &&
          token.length === 1 &&
          lineGrammarTokenNames.includes(token[0].name)
        ) {
          // consume a newline after line grammar
          this.newLine();
        }
        if (token) {
          tokens = tokens.concat(token);
          tokens = flattenPlainText(tokens);
          break;
        }
      }
    }

    return {
      redirect: false,
      result: tokens,
    };
  }

  private lineGrammars(): TokenizerSubMethodReturnType {
    return this.choice([this.headingGrammar, this.horizontalLine]);
  }

  private horizontalLine(): TokenizerSubMethodReturnType {
    if (!this.isLineStartNow()) {
      return null;
    }

    const lineConsumed = this.consumeIfRegex(/^-{4,9}$/);
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

  private headingGrammar(): TokenizerSubMethodReturnType {
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

        const lineConsumed = this.consumeIfRegex(patternText);
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
  }

  private escapeSequence(): TokenizerSubMethodReturnType {
    const consumed = this.consumeIfRegex(/\/([^/])/);
    if (consumed) {
      return [
        {
          name: "plainText",
          content: consumed.match[1],
        },
      ];
    } else {
      return null;
    }
  }

  private plainNonNewLineCharacter(): TokenizerSubMethodReturnType {
    const consumed = this.consumeCharacter(/[^\n]/);
    if (consumed) {
      return [
        {
          name: "plainText",
          content: consumed.character,
        },
      ];
    } else {
      return null;
    }
  }

  private newLine(): TokenizerSubMethodReturnType {
    const consumed = this.consumeCharacter("\n");
    if (consumed) {
      return [{ name: "newLine" }];
    } else {
      return null;
    }
  }

  private wikiParagraph(): TokenizerSubMethodReturnType {
    let tokens: NamumarkToken[] | null = null;
    while (!this.isEndOfText()) {
      const result = this.wikiParagraphContent();

      if (result) {
        tokens = (tokens === null ? ([] as NamumarkToken[]) : tokens).concat(
          result
        );
      } else {
        break;
      }
    }
    this.inlineMarkups = [];
    return tokens;
  }

  private wikiParagraphContent(): TokenizerSubMethodReturnType {
    return this.isEndOfText()
      ? null
      : this.choice([
          this.inlineTextDecorationMarkup,
          this.escapeSequence,
          this.bracketInlineDecoration,
          this.inlineNowikiPre,
          this.plainNonNewLineCharacter,
        ]);
  }

  private isEndOfText(): boolean {
    return this.pos >= this.wikitext.length;
  }

  private inlineNowikiPre(): TokenizerSubMethodReturnType {
    const consumed = this.consumeIfRegex(/\{\{\{/);
    if (consumed) {
      const rollback = consumed.posRollbacker;
      let content = "";
      while (!this.isEndOfText() && this.seekCharacter() !== "\n") {
        const closure = this.consumeIfRegex(/\}\}\}/);
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

  private bracketInlineDecoration(): TokenizerSubMethodReturnType {
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
    const consumed = this.consumeIfRegex(
      "\\{\\{\\{(([\\+-][1-5])|" + colorPattern + ") "
    );

    if (consumed) {
      let children: NamumarkToken[] = [];
      while (!this.isEndOfText() && this.seekCharacter() !== "\n") {
        const closure = this.consumeIfRegex(/\}\}\}/);
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
          const innerChild = this.wikiParagraphContent();
          if (innerChild) {
            children = children.concat(innerChild);
          }
        }
      }
      consumed.posRollbacker();
      return null;
    }

    return null;
  }

  private choice(
    tokenizers: TokenizerSubMethod[]
  ): TokenizerSubMethodReturnType {
    for (let i = 0; i < tokenizers.length; i++) {
      const tokenizer = tokenizers[i];
      const token = tokenizer();
      if (token) {
        return token;
      }
    }
    return null;
  }

  private inlineTextDecorationMarkup(): TokenizerSubMethodReturnType {
    const markups = ["'''''", "'''", "''", "__", "~~", "--", "\\^\\^", ",,"];
    for (const markup of markups) {
      // Try to consume text decoration start markup
      const consumed = this.consumeIfRegex(
        markup,
        markup === "'''" ? "'''''" : markup === "''" ? /'''('')?/ : null
      );
      if (consumed) {
        // Text decoration started
        // Create position rollback
        const rollback = consumed.posRollbacker;

        // If it wasn't start markup, render it as plain text.
        // ignoring(returning null) makes a bug that "'''" becomes "'" (plaintext) + "''" (markup) under certain conditions
        if (this.inlineMarkups.includes(markup)) {
          return [
            {
              name: "plainText",
              content: consumed.match[0],
            },
          ];
        }

        // Push current text decoration, parser is currently working on, into the stack
        // For FIFO enforcement
        this.inlineMarkups.push(markup);

        // Inner content of text deocration
        let innerTokens: NamumarkToken[] = [];

        // Loop while newline or eot
        while (!this.isEndOfText() && this.seekCharacter() !== "\n") {
          // Get end markups
          const endMarkups = markups.filter((i) =>
            this.inlineMarkups.includes(i)
          );
          let markupEndConsumed = null,
            endedMarkup = null;

          // Test for all end markups
          for (const endMarkup of endMarkups) {
            markupEndConsumed = this.consumeIfRegex(endMarkup);
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
                this.inlineMarkups.lastIndexOf(endedMarkup);
              this.inlineMarkups.splice(
                indexOfEndedMarkup,
                this.inlineMarkups.length - indexOfEndedMarkup
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
            const innerTokensTokenized = this.wikiParagraphContent();
            if (innerTokensTokenized)
              innerTokens = innerTokens.concat(innerTokensTokenized);
            else if (innerTokens.length !== 0) break;
          }
        }
        rollback();
      }
    }

    return null;
  }

  private seekCharacter() {
    if (this.isEndOfText()) return null;
    else return this.wikitext[this.pos];
  }

  private consumeCharacter(pattern?: string | RegExp): {
    posRollbacker: PosRollbacker;
    character: string;
  } | null {
    const ch = this.wikitext[this.pos];
    if (pattern) {
      if (typeof pattern === "string") pattern = new RegExp(pattern);
      if (!pattern.test(ch)) {
        return null;
      }
    }
    const posRollbacker = this.createPosRollbacker();
    this.pos++;
    return {
      posRollbacker,
      character: ch,
    };
  }

  private createPosRollbacker(pos?: number): PosRollbacker {
    const deepCloned = deepClone(pos ?? this.pos);
    return (() => {
      this.pos = deepCloned;
    }).bind(this);
  }

  private isLineStartNow(): boolean {
    return this.pos === 0 || this.wikitext[this.pos - 1] === "\n";
  }

  private consumeIfRegex(
    pattern: RegExp | string,
    negativePattern: RegExp | string | null = null
  ): null | { posRollbacker: PosRollbacker; match: RegExpMatchArray } {
    // Match for pattern
    pattern = new RegExp(pattern, "ym");
    pattern.lastIndex = this.pos;
    const match = this.wikitext.match(pattern);

    // Match for negative pattern if given
    let negativeMatched = false;
    if (negativePattern) {
      negativePattern = new RegExp(negativePattern, "ym");
      negativePattern.lastIndex = this.pos;
      const negativeMatch = this.wikitext.match(negativePattern);
      negativeMatched =
        negativeMatch !== null && negativeMatch.index === this.pos;
    }

    // Return result
    if (match && !negativeMatched && this.pos === match.index) {
      const posRollbacker = this.createPosRollbacker(this.pos);
      this.pos += match[0].length;
      return { posRollbacker, match };
    } else {
      return null;
    }
  }

  /**
   * Tests wikitext for whether it's redirect document and returns redirect target it is.
   * @param wikitext Wikitext to parse
   * @returns Returns redirect target if it's redirect document, and returns null if it's not redirect.
   */
  private redirect(wikitext: string): string | null {
    const redirectGrammarPattern = /^$(redirect|넘겨주기) (.+?)$/m;
    const firstLine = wikitext.includes("\n")
      ? wikitext.substring(0, wikitext.indexOf("\n"))
      : wikitext;
    if (redirectGrammarPattern.test(firstLine)) {
      const regexResult = redirectGrammarPattern.exec(firstLine);
      if (regexResult) {
        return regexResult[1];
      }
    }
    return null;
  }
}
