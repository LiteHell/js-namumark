module.exports = (text, type) => {
    return [{name: "closure-start"}, {name: "wikitext", parseFormat: true, text: text}, {name: "closure-end"}];
}