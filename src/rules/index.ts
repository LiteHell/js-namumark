import headings from "./headings";
import singleBrackets from "./singleBrackets";
import multiBrackets from "./multiBrackets";
import listTags from "./listTags";
import decorations from "./decorations";

export default {
  headings,
  singleBrackets: singleBrackets.concat(decorations),
  multiBrackets,
  listTags,
};
