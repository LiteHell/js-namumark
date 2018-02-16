module.exports = (text, type) => {
    if (/^#!html/i.test(text)) {
        return [{
            name: "unsafe-plain",
            text: text.substring(6)
        }];
    } else if (/^#!folding/i.test(text) && text.indexOf('\n') >= 10) {
        return [{
                name: "folding-start",
                summary: text.substring(10, text.indexOf('\n'))
            }, {
                name: "wikitext",
                treatAsBlock: true,
                text: text.substring(text.indexOf('\n') + 1)
            },
            {
                name: "folding-end"
            }
        ];
    } else if (/^#!syntax/i.test(text) && text.indexOf('\n') >= 9) {
        return [{
            name: "syntax-highlighting",
            header: text.substring(9, text.indexOf('\n')),
            body: text.substring(text.indexOf('\n') + 1)
        }];
    } else if (/^#!wiki/i.test(text)) {
        if (text.indexOf('\n') >= 7) {
            let params = text.substring(7, text.indexOf('\n'));
            if (params.startsWith("style=\"") && /" +$/.test(params)) {
                return [{
                    name: "wiki-box-start",
                    style: params.substring(7, params.length - /" +$/.exec(params)[0].length)
                }, {
                    name: "wikitext",
                    treatAsBlock: true,
                    text: text.substring(text.indexOf('\n') + 1)
                }, {
                    name: "wiki-box-end"
                }]
            } else {
                return [{
                    name: "wiki-box-start"
                }, {
                    name: "wikitext",
                    treatAsBlock: true,
                    text: text.substring(text.indexOf('\n') + 1)
                }, {
                    name: "wiki-box-end"
                }]

            }
        }
    } else if (/^#([A-Fa-f0-9]{3,6}) (.*)$/.test(text)) {
        let matches = /^#([A-Fa-f0-9]{3,6}) (.*)$/.exec(text);
        if (matches[1].length === 0 && matches[2].length === 0)
            return [{
                name: "plain",
                text: text
            }];
        return [{
            name: "font-color-start",
            color: matches[1]
        }, {
            name: "wikitext",
            parseFormat: true,
            text: matches[2]
        }, {
            name: "font-color-end"
        }];
    } else if (/^\+([1-5]) (.*)$/.test(text)) {
        let matches = /^\+([1-5]) (.*)$/.exec(text);
        return [{
            name: "font-size-start",
            level: matches[1]
        }, {
            name: "wikitext",
            parseFormat: true,
            text: matches[2]
        }, {
            name: "font-size-end"
        }];
    };
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