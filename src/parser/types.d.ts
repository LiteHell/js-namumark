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

type NamumarkTokenName =
  | "plainText"
  | "heading"
  | "redirect"
  | "textDecoration"
  | "textColor"
  | "textSize"
  | "newLine"
  | "horizontalLine"
  | "pre";

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
);

type NamumarkParserResult = {
  redirect: boolean;
  result: NamumarkToken[];
};

type PosRollbacker = () => void;
type TokenizerSubMethodReturnType = NamumarkToken[] | null;
type TokenizerSubMethod = () => TokenizerSubMethodReturnType;
