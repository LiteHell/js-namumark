import {
  bracketInlineDecoration,
  HyperLinkLike,
  inlineNowikiPre,
  inlineTextDecorationMarkup,
  wikiParagraph,
  wikiParagraphContent,
  heading,
  horizontalLine,
  lineGrammar,
  escapeSequence,
  newLine,
  plainNonNewLineCharacter,
} from "./tokenizers";
import deepClone from "./utils/deepClone";
import flattenPlainText from "./utils/flattenPlainText";

type TokenizerDictionary = {
  [key in NamumarkTokenizerName]: TokenizerSubMethod;
};

/**
 * Namumark parser for tokenizing purpose
 */
export default class NamumarkParser {
  private wikitext: string;
  private parseInlineOnly: boolean;
  private pos: number;
  private state: NamumarkParserState = {
    inlineMarkups: [],
  };
  private tokenizers: TokenizerDictionary = {} as TokenizerDictionary;

  /**
   * Initializes NamumarkParser
   * @param wikitext Wikitext to parse
   */
  constructor(wikitext: string, parseInlineOnly = false) {
    this.wikitext = wikitext;
    this.parseInlineOnly = parseInlineOnly;
    this.pos = 0;

    // bind all helper functions
    this.isEndOfText = this.isEndOfText.bind(this);
    this.choice = this.choice.bind(this);
    this.seekCharacter = this.seekCharacter.bind(this);
    this.consumeCharacter = this.consumeCharacter.bind(this);
    this.createPosRollbacker = this.createPosRollbacker.bind(this);
    this.isLineStartNow = this.isLineStartNow.bind(this);
    this.tryTokenize = this.tryTokenize.bind(this);
    this.consumeIfRegexMatches = this.consumeIfRegexMatches.bind(this);
    this.createHelper = this.createHelper.bind(this);
    this.registerTokenizers = this.registerTokenizers.bind(this);

    // register line grammar related tokenizers
    this.registerTokenizers("horizontalLine", horizontalLine);
    this.registerTokenizers("lineGrammar", lineGrammar);
    this.registerTokenizers("heading", heading);

    // register text related tokenizers
    this.registerTokenizers("escapeSequence", escapeSequence);
    this.registerTokenizers(
      "plainNonNewLineCharacter",
      plainNonNewLineCharacter
    );
    this.registerTokenizers("newLine", newLine);

    // register inline grammar related tokenizers
    this.registerTokenizers("bracketInlineDecoration", bracketInlineDecoration);
    this.registerTokenizers("inlineNowikiPre", inlineNowikiPre);
    this.registerTokenizers(
      "inlineTextDecorationMarkup",
      inlineTextDecorationMarkup
    );
    this.registerTokenizers("wikiParagraph", wikiParagraph);
    this.registerTokenizers("wikiParagraphContent", wikiParagraphContent);
    this.registerTokenizers("HyperLinkLike", HyperLinkLike);
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
    const tokenizers: NamumarkTokenizerName[] = this.parseInlineOnly
      ? ["escapeSequence", "wikiParagraph"]
      : ["escapeSequence", "lineGrammar", "wikiParagraph", "newLine"];
    while (!this.isEndOfText()) {
      for (const tokenizer of tokenizers) {
        const token = this.tryTokenize(tokenizer);
        if (
          token &&
          token.length === 1 &&
          lineGrammarTokenNames.includes(token[0].name)
        ) {
          // consume a newline after line grammar
          this.tryTokenize("newLine");
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

  private registerTokenizers(
    name: NamumarkTokenizerName,
    func: TokenizerSubMethod
  ) {
    const helper = this.createHelper();
    this.tokenizers[name] = func.bind(helper);
  }

  private tryTokenize(
    name: NamumarkTokenizerName
  ): TokenizerSubMethodReturnType {
    // Tokenizer methods are already bound on registeration
    return (this.tokenizers[name] as () => TokenizerSubMethodReturnType)();
  }

  private createHelper(): NamumarkParserHelper {
    return {
      isEndOfText: this.isEndOfText,
      choice: this.choice,
      tryTokenize: this.tryTokenize,
      seekCharacter: this.seekCharacter,
      consumeCharacter: this.consumeCharacter,
      createPosRollbacker: this.createPosRollbacker,
      isLineStartNow: this.isLineStartNow,
      consumeIfRegexMatches: this.consumeIfRegexMatches,
      state: this.state,
    };
  }

  private isEndOfText(): boolean {
    return this.pos >= this.wikitext.length;
  }

  private choice(
    tokenizerNames: NamumarkTokenizerName[]
  ): TokenizerSubMethodReturnType {
    for (let i = 0; i < tokenizerNames.length; i++) {
      const token = this.tryTokenize(tokenizerNames[i]);
      if (token) {
        return token;
      }
    }
    return null;
  }

  private seekCharacter() {
    if (this.isEndOfText()) return null;
    else return this.wikitext[this.pos];
  }

  private consumeCharacter(pattern?: string | RegExp): {
    rollback: PosRollbacker;
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
      rollback: posRollbacker,
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

  private consumeIfRegexMatches(
    pattern: RegExp | string,
    negativePattern: RegExp | string | null = null
  ): null | { rollback: PosRollbacker; match: RegExpMatchArray } {
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
      return { rollback: posRollbacker, match };
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
