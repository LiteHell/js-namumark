module.exports = (text, type, configs) => {
    let defaultResult = [{name: "plain", text: `[${text}]`}];
    if (text.startsWith('*') && /^\*([^ ]*) (.+)$/.test(text)) {
        let matches = /^\*([^ ]*) (.+)$/.exec(text);
        return [{
            name: "footnote-start",
            supText: matches[1].length === 0 ? null : matches[1]
        }, {
            name: "wikitext",
            treatAsBlock: true,
            text: matches[2]
        }, {
            name: "footnote-end"
        }];
    } else {
        if(/^[^\(]+$/.test(text)) {
            if(configs.macroNames.indexOf(text) == -1)
                return defaultResult;
            else
                return [{name: "macro", macroName: text}];
        } else if(/^([^\(]+)\((.*)\)/.test(text)){
            let matches = /^([^\(]+)\((.*)\)/.exec(text);
            if(configs.macroNames.indexOf(matches[1]) == -1)
                return defaultResult;
            let macroName = matches[1], 
                optionSplitted = matches[2].split(','),
                options = [];
            if(matches[2].length != 0) {
                for(let i of optionSplitted) {
                    if(i.indexOf('=') == -1) {
                        options.push(i);
                    } else {
                        options.push({name: i.split('=')[0], value: i.split('=')[1]});
                    }
                }
            }
            return [{name: "macro", macroName: macroName, options: options}];
        }
        return defaultResult;
    }
}