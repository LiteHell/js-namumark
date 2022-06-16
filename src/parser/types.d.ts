type NamuMarkRendererResult =
  | {
      categories: string[];
      redirect: false;
      result: any;
    }
  | {
      redirect: true;
      target: string;
    };

type NamumarkTokenizerName =
  | "lineGrammar"
  | "horizontalLine"
  | "heading"
  | "escapeSequence"
  | "plainNonNewLineCharacter"
  | "newLine"
  | "wikiParagraph"
  | "wikiParagraphContent"
  | "inlineTextDecorationMarkup"
  | "bracketInlineDecoration"
  | "inlineNowikiPre"
  | "plainNonNewLineCharacter"
  | "HyperLinkLike"
  | "Macro"
  | "Footnote";

type NamumarkParserState = {
  inlineMarkups: string[];
};

type NamumarkParserOptions = {
  parseInlineOnly: boolean;
  macroNames: string[];
};

type NamumarkParserHelper = {
  isEndOfText: () => boolean;
  choice: (tokenizers: NamumarkTokenizerName[]) => TokenizerSubMethodReturnType;
  seekCharacter: () => string | null;
  consumeCharacter: (
    pattern?: string | RegExp | undefined
  ) => { rollback: PosRollbacker; character: string } | null;
  createPosRollbacker: (pos?: number | undefined) => PosRollbacker;
  tryTokenize: (name: NamumarkTokenizerName) => TokenizerSubMethodReturnType;
  isLineStartNow: () => boolean;
  consumeIfRegexMatches: (
    pattern: string | RegExp,
    negativePattern?: string | RegExp | null
  ) => {
    rollback: PosRollbacker;
    match: RegExpMatchArray;
  } | null;
  getMacroNames(): string[];
  state: NamumarkParserState;
};

type NamumarkTokenName =
  | "plainText"
  | "heading"
  | "redirect"
  | "textDecoration"
  | "textColor"
  | "textSize"
  | "newLine"
  | "horizontalLine"
  | "pre"
  | "image"
  | "category"
  | "link"
  | "macro"
  | "footnote";

type NamumarkTextSizeLevel = -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5;
type NamumarkToken = {
  name: NamumarkTokenName;
} & (
  | { name: "textColor"; color: string; children: NamumarkToken[] }
  | {
      name: "textSize";
      level: NamumarkTextSizeLevel;
      children: NamumarkToken[];
    }
  | {
      name: "plainText";
      content: string;
    }
  | {
      name: "pre";
      inline: boolean;
      children: NamumarkToken[];
    }
  | {
      name: "heading";
      children: NamumarkToken[];
      headingLevel: number;
    }
  | {
      name: "redirect";
      redirectTarget: string;
    }
  | {
      name: "textDecoration";
      markupType: string;
      children: NamumarkToken[];
    }
  | { name: "newLine" | "horizontalLine" }
  | {
      name: "image";
      image: string;
      options: Partial<NamumarkImageTokenOptions>;
    }
  | {
      name: "category";
      category: string;
      blurred: boolean;
    }
  | {
      name: "link";
      target: string;
      children: NamumarkToken[];
    }
  | { name: "macro"; macroName: string; options?: string }
  | { name: "footnote"; footnoteName?: string; children: NamumarkToken[] }
);

type NamumarkImageTokenOptions = {
  width: number | string;
  height: number | string;
  horizontalAlign: "left" | "center" | "right";
  verticalAlign: "top" | "bottom";
  backgroundColor: string;
};

type NamumarkParserResult = {
  redirect: boolean;
  result: NamumarkToken[];
};

type PosRollbacker = () => void;
type TokenizerSubMethodReturnType = NamumarkToken[] | null;
type TokenizerSubMethod = (
  this: NamumarkParserHelper
) => TokenizerSubMethodReturnType;
