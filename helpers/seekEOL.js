module.exports = function seekEOL(text, offset = 0) {
    return text.indexOf('\n', offset) == -1 ? text.length : text.indexOf('\n', offset);
}