import { NamuMarkOptions } from "./types";

const defaultOptions: NamuMarkOptions = {
  wiki: {
    read: async () => null, // return null if not found, return content if found
  },
  allowedExternalImageExts: ["jpg", "jpeg", "png", "gif"],
  included: false,
  includeParameters: {},
  macroNames: [
    "br",
    "date",
    "목차",
    "tableofcontents",
    "각주",
    "footnote",
    "toc",
    "youtube",
    "include",
    "age",
    "dday",
  ],
};

export default defaultOptions;
