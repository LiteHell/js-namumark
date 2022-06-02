type ProcessorName =
  | "renderProcessor"
  | "textProcessor"
  | "closureProcessor"
  | "linkProcessor"
  | "macroProcessor";
type ListTagType =
  | "decimal"
  | "upper-alpha"
  | "lower-alpha"
  | "upper-roman"
  | "lower-roman";
type ListRule = {
  [key: string]:
    | { ordered: false }
    | {
        ordered: true;
        type: ListTagType;
      };
};
type HeadingRule = {
  [key: string]: number;
};
type BracketRule = {
  open: string;
  close: string;
  multiline: boolean;
  processor: ProcessorName;
};
