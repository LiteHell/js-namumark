const rules: ListRule = {
  "*": { ordered: false },
  "1.": { ordered: true, type: "decimal" },
  "A.": { ordered: true, type: "upper-alpha" },
  "a.": { ordered: true, type: "lower-alpha" },
  "I.": { ordered: true, type: "upper-roman" },
  "i.": { ordered: true, type: "lower-roman" },
};

export default rules;
