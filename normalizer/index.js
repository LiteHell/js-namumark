function removeUnpaireds(tokens) {
    let headingLevels = [],
        decorations = [],
        brackets = [],
        links = [],
        references = [],
        indents = [],
        lists = [],
        bqs = [],
        maths = [];
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        switch (token.name) {
            case "redirect":
            case "blockquote":
            case "hr":
            case "macro":
            case "indent":
            case "list-item":
            case "plain": // no need to normalize
                break;
            case "heading-start":
                headingLevels.push(i);
                break;
            case "heading-end":
                if (headingLevels.length == 0) {
                    tokens[i].paired = false;
                    break;
                }
                let lastHeadingStartIndex = headingLevels[headingLevels.length - 1],
                    lastHeadingStartToken = tokens[lastHeadingStartIndex];
                if (lastHeadingStart.level === token.level) {
                    tokens[i].paired = true;
                    tokens[lastHeadingStartIndex].paired = true;
                }
                break;
            case "bracket-start":
                brackets.push(i);
                break;
            case "bracket-end":
                if (brackets.length == 0) {
                    tokens[i].paired = false;
                    break;
                }
                let lastBracketStartIndex = brackets[brackets.length - 1],
                    lastBracketStartToken = tokens[lastBracketStartIndex];
                if (lastBracketStart.level === token.level) {
                    tokens[i].paired = true;
                    tokens[lastBracketStartIndex].paired = true;
                }
                break;
            case "link-start":
                links.push(i);
                break;
            case "link-end":
                if (links.length == 0) {
                    tokens[i].paired = false;
                    break;
                }
                let lastLinkStartIndex = link[links.length - 1],
                    lastLinkStartToken = tokens[lastLinkStartIndex];
                if (lastLinkStart.level === token.level) {
                    tokens[i].paired = true;
                    tokens[lastLinkStartIndex].paired = true;
                }
                break;
            case "math-start":
            case "math-end":
            case "ref-start":
            case "ref-end":
            case "text-decoration":
                break;
            case "newline":
        }
    }
}
module.exports = (tokens) => {
    // list ?

}