module.exports = [{
    open: '{{{',
    close: '}}}',
    multiline: false,
    processor: 'textProcessor'
}, {
    open: '{{|',
    close: '|}}',
    multiline: false,
    processor: 'closureProcessor'
}, {
    open: '[[',
    close: ']]',
    multiline: false,
    processor: 'linkProcessor'
}, {
    open: '[',
    close: ']',
    multiline: false,
    processor: 'macroProcessor'
}]