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
  | "newLine"
  | "horizontalLine"
  | "pre";

type NamumarkToken = {
  name: NamumarkTokenName;
} & (
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
