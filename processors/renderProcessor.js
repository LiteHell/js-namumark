module.exports = (text, type) => {
    if (/^#!html/i.test(text)) {
        return [{
            name: "unsafe-plain",
            text: text.substring(6)
        }];
    }
    return [{
        name: "monoscape-font-start",
        pre: true
    }, {
        name: "plain",
        text: text.substring(1)
    }, {
        name: "monoscape-font-end"
    }];
}