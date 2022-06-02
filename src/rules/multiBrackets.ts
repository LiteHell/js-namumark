const rules: BracketRule[] = [
  {
    open: "{{{",
    close: "}}}",
    multiline: true,
    processor: "renderProcessor",
  },
];

export default rules;
