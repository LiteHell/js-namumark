let formats = ["'''", "''", "~~", "--", "__", "^^", ",,"],
    result = [];
for(let i = 0; i < formats.length; i++) {
    result.push({
        open: formats[i],
        close: formats[i],
        multiline: false,
        processor: 'textProcessor'
    })
}
module.exports = result;