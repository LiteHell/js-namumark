import NormalizeColor from "../../utils/NormalizeColor";

export const HyperLinkLike: TokenizerSubMethod = function () {
  /**
   * Image embedding : [[파일:example.png|width=100&align=100]]
   * Category : [[분류:example]]
   *   - Link to category doc: [[:분류:example]] or [[ 분류:example]]
   *   - Hidden category: [[분류:example#blur]]
   */
  const consumed = this.consumeIfRegexMatches(/\[\[/);
  if (consumed) {
    let target = "", // Link target or image name or category name
      options = "", // Image options
      children: NamumarkToken[] = []; // Link content;
    let isOptionsNow = false, // is currently parsing image options or link children?
      fileEmbed = false, // is image embeeding syntax
      category = false, // is category syntax
      linkToFileOrCategory = false; // is link to image or category syntax

    while (!this.isEndOfText() && this.seekCharacter() !== "\n") {
      const closure = this.consumeIfRegexMatches(/\]\]/);
      if (closure) {
        fileEmbed = target.startsWith("파일:");
        category = target.startsWith("분류:");
        linkToFileOrCategory = /^[\s:](파일|분류):/m.test(target);

        // Remove first character when it's link to file or category document
        if (linkToFileOrCategory) {
          target = target.substring(1);
        }

        // Return token
        if (fileEmbed) {
          return [
            {
              name: "image",
              image: target,
              options: parseImageOptions(options),
            },
          ];
        } else if (category) {
          const blurred = target.endsWith("#blur");
          if (blurred) target = target.replace(/#blur$/, "");
          return [{ name: "category", category: target, blurred }];
        } else {
          if (children.length === 0) {
            children = [
              {
                name: "plainText",
                content: target,
              },
            ];
          }
          return [{ name: "link", target, children }];
        }
      } else {
        if (isOptionsNow) {
          // parse options or children
          if (fileEmbed || category) {
            const ch = this.consumeCharacter();
            if (ch) {
              options += ch.character;
            }
          } else {
            const child = this.tryTokenize("wikiParagraphContent");
            if (child) {
              children = children.concat(child);
            } else {
              consumed.rollback();
              return null;
            }
          }
        } else {
          // parse target
          const escapeSequence = this.tryTokenize("escapeSequence");
          const escaped = escapeSequence !== null;
          const ch =
            escapeSequence && escapeSequence[0].name === "plainText"
              ? escapeSequence[0].content
              : this.consumeCharacter()?.character;
          if (ch === "|" && !escaped) {
            fileEmbed = target.startsWith("파일:");
            category = target.startsWith("분류:");
            linkToFileOrCategory = /^[\w:](파일|분류):/m.test(target);
            isOptionsNow = true;
          } else if (ch) {
            target += ch;
          } else {
            break;
          }
        }
      }
    }
    consumed.rollback();
  }
  return null;
};

function parseImageOptions(
  optionsStr: string
): Partial<NamumarkImageTokenOptions> {
  const options = optionsStr.split("&");
  const result: Partial<NamumarkImageTokenOptions> = {};
  for (const i of options) {
    const pair = i.split("=");
    if (pair.length < 2) continue;
    let value = pair[1].toLowerCase();
    switch (pair[0]) {
      case "width":
        if (/[0-9]+/.test(value)) result.width = parseInt(value);
        else if (/[0-9]+%/.test(value)) result.width = value;
        break;
      case "height":
        if (/[0-9]+/.test(value)) result.height = parseInt(value);
        else if (/[0-9]+%/.test(value)) result.height = value;
        break;
      case "align":
        if (value === "middle") value = "center";
        if (value === "left" || value === "center" || value === "right") {
          result.horizontalAlign = value;
        } else if (value === "top" || value === "bottom") {
          result.verticalAlign = value;
        }
        break;
      case "bgcolor": {
        const color = NormalizeColor(value);
        if (color) {
          result.backgroundColor = value;
        }
        break;
      }
    }
  }

  return result;
}
