const rules: BracketRule[] = [
  {
    open: "{{{",
    close: "}}}",
    multiline: false,
    processor: "textProcessor",
  },
  {
    open: "{{|",
    close: "|}}",
    multiline: false,
    processor: "closureProcessor",
  },
  {
    open: "[[",
    close: "]]",
    multiline: false,
    processor: "linkProcessor",
  },
  {
    open: "[",
    close: "]",
    multiline: false,
    processor: "macroProcessor",
  },
  {
    open: "@",
    close: "@",
    multiline: false,
    processor: "textProcessor",
  },
];

export default rules;
