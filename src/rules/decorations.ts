const formats: string[] = ["'''", "''", "~~", "--", "__", "^^", ",,"],
  rules: BracketRule[] = [];
for (let i = 0; i < formats.length; i++) {
  rules.push({
    open: formats[i],
    close: formats[i],
    multiline: false,
    processor: "textProcessor",
  });
}

export default rules;
