module.exports = (text, type) => {
    let styles = {
        "'''": "strong",
        "''": "italic",
        "--": "strike",
        "~~": "strike",
        "__": "underline",
        "^^": "superscript",
        ",,": "subscript"
    }
    switch(type) {
        case "'''":
        case "''":
        case "--":
        case "~~":
        case "__":
        case "^^":
        case ",,":
            return [{name: `${styles[type]}-start`}, {name: "wikitext", parseFormat: true, text: text}, {name: `${styles[type]}-end`}];
        case "{{{":
            if(text.startsWith('#!html')) {
                return [{name: "unsafe-plain", text: text.substring(6)}];
            } else if(/^#([A-Fa-f0-9]{3,6}) (.*)$/.test(text)) {
                let matches = /^#([A-Fa-f0-9]{3,6}) (.*)$/.exec(text);
                if(matches[1].length === 0 && matches[2].length === 0)
                    return [{name: "plain", text: text}];
                return [{name: "font-color-start", color: matches[1]}, {name: "wikitext", parseFormat: true, text: matches[2]}, {name: "font-color-end"}];
            } else if(/^\+([1-5]) (.*)$/.test(text)) {
                let matches = /^\+([1-5]) (.*)$/.exec(text);
                return [{name: "font-size-start", level: matches[1]}, {name: "wikitext", parseFormat: true, text: matches[2]}, {name: "font-size-end"}];
            };
            return [{name: "monoscape-font-start"}, {name: "plain", text: text}, {name: "monoscape-font-end"}]
    }
    return [{name: "plain", text: `${type}${text}${type}`}];
}