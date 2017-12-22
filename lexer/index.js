let redirectPattern = /^#(redirect|넘겨주기) (.+?)$/,
    decorations = require('./decorations.json');

function doLex(wikitext) {
    // redirect
    if (wikitext.search(redirectPattern) === 0) {
        let matches = redirectPattern.exec(wikitext);
        return [{
            name: "redirect",
            target: matches[2],
            raw: matches[0]
        }];
    }
    let result = [];
    for (let i = 0; i < wikitext.length; i++) {
        let isLineStarting = i == 0 || wikitext[i - 1] == '\n';
        let substringed = wikitext.substring(i);
        // Heading
        if (isLineStarting && substringed.search(/^(=+) /) == 0) {
            let matches = /^(#+) /.exec(substringed);
            result.push({
                name: "heading-start",
                level: matches[1].length,
                raw: matches[0]
            });
            i += matches[0].length - 1;
            continue;
        } else if (!isLineStarting && substringed.search(/^ (=+)$/) == 0) {
            let matches = /^(#+) /.exec(substringed);
            result.push({
                name: "heading-end",
                level: matches[1].length,
                raw: matches[0]
            });
            i += matches[0].length - 1;
            continue;
        }
        // start of brackets: nomarkup, html, wiki, syntax
        // start of brakcets: some text decorations (text size, color, ...)
        // end of bracket
        if (substringed.startsWith('{{{')) {
            result.push({
                name: "bracket-start",
                raw: "{{{"
            });
            i += 2;
            continue;
        } else if (substringed.startsWith('}}}')) {
            result.push({
                name: "bracket-end",
                raw: "{{{"
            });
            i += 2;
            continue;
        }

        // hr, comment
        if (isLineStarting && substringed.search(/^----{1,6}$/) === 0) {
            let matches = /----{1,6}$/.exec(substringed);
            result.push({
                name: "hr",
                raw: matches[0]
            });
            i += matches[0].length - 1
            continue;
        }

        // list, indent, blockquote
        if (isLineStarting && substringed.search(/^ +(\*|[1AaIi]\.)/) === 0) {
            let matches = /^ +(\*|[1AaIi]\.)$/.exec(substringed);
            result.push({
                name: "list-item",
                type: matches[2],
                level: matches[1].length,
                raw: matches[0]
            });
            i += matches[0].length - 1
            continue;
        }
        if (isLineStarting && substringed.search(/^( +)/) === 0) {
            let matches = /^( +)/.exec(substringed);
            result.push({
                name: "indent",
                level: matches[1].length,
                raw: matches[0]
            });
            i += matches[0].length - 1
            continue;
        }
        if (isLineStarting && substringed.search(/^(>+)/) === 0) {
            let matches = /^(>+)/.exec(substringed);
            result.push({
                name: "blockquote",
                level: matches[1].length,
                raw: matches[0]
            });
            i += matches[0].length - 1
            continue;
        }

        // link, macro, math, reference 
        if (substringed.indexOf('[[') == 0) {
            result.push({
                name: 'link-start',
                raw: '[['
            });
            i += 1;
            continue;
        } else if (substringed.indexOf(']]') == 0) {
            result.push({
                name: 'link-end',
                raw: ']]'
            });
            i += 1;
            continue;
        } else if (substringed.search(/\[([a-zA-Z]+)(\(.+\)|)\]/) == 0) {
            let matches = /\[([a-zA-Z]+)(\(.+\)|)\]/.exec(substringed);
            let parameters = matches[2];
            if (parameters.length > 0)
                parameters = parameters.substring(1, parameters.length - 1);
            else
                parameters = "";
            result.push({
                name: "macro",
                macroName: matches[1],
                parameters: parameters,
                raw: matches[0]
            });
        } else if (substringed.indexOf('<math>') == 0) {
            result.push({
                name: 'math-start',
                raw: '<math>'
            });
            i += 5;
            continue;
        } else if (substringed.indexOf('</math>') == 0) {
            result.push({
                name: 'math-end',
                raw: '</math>'
            });
            i += 6;
            continue;
        } else if (substringed.search(/\[\*(.?) /) == 0) {
            let matches = /\[\*(.?) /.exec(substringed);
            result.push({
                name: 'ref-start',
                refname: matches[1],
                raw: matches[2]
            });
            i += matches[0].length - 1;
            continue;
        } else if (substringed.indexOf(']') == 0) {
            result.push({
                name: 'ref-end',
                raw: ']'
            });
            continue;
        }

        // Text deocration (text-decoration only) : NOTE : some(font-size, color) has brackets!
        let continueLoop = false;
        for(let j = 0; j < decorations.length; j++) {
            let deco = decorations[j];
            if (substringed.indexOf(deco.value) == 0) {
                result.push({
                    name: "text-decoration",
                    decoName: deco.name,
                    raw: deco.value
               });
               i += deco.value - 1;
               breakLoop = true;
               break;
            }
        }
        if(continueLoop) continue;

        // table
        // TO-DO

        // newline
        if (substringed[0].indexOf('\n') == 0) {
            result.push({
                name: 'newline',
                raw: '\n'
            });
            continue;
        }

        // plain if nothing
        if (result[result.length - 1].name == "plain") {
            result[result.length - 1].raw += substringed[0];
        } else {
            result.push({
                name: "plain",
                raw: substringed[0]
            });
        }
    }
}
module.exports = doLex;