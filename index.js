const defaultOptions = require('./defaultOptions.js'),
    extend = require('extend'),
    async = require('async'),
    {multiBrackets} = require('./rules'),
    redirectPattern = /^#(?:redirect|넘겨주기) (.+)$/im,
    {
        listParser,
        tableParser,
        blockquoteParser,
        bracketParser
    } = require('./parsers'),
    {
        seekEOL
    } = require('./helpers');

function Namumark(articleName, _options) {
    let options = extend(true, defaultOptions, _options),
        wikitext = options.wiki.read(articleName),
        rendererClass = require('./basicHTMLRenderer'),
        rendererOptions = null,
        renderer = null;

    function doParse(callback) {
        renderer = rendererOptions ? new rendererClass(rendererOptions) : new rendererClass();
        let line = '',
            now = '',
            tokens = [];
        if (wikitext === null)
            return [{name: "error", type: "notfound"}];
        if (wikitext.startsWith('#') && redirectPattern.test(wikitext) && redirectPattern.exec(wikitext).index === 0) {
            return [{name: "redirect", target: redirectPattern.exec(wikitext)[1]}];
        }
        for (let i = 0; i < wikitext.length; i++) {
            let temp = {
                pos: i
            };
            now = wikitext[i];
            if (line == '' && now == ' ' && (temp = listParser(wikitext, i, v => i = v))) {
                tokens = tokens.concat(temp);
                line = '';
                now = '';
                continue;
            }
            if (line == '' && wikitext.substring(i).startsWith('|') && (temp = tableParser(wikitext, i, v => i = v))) {
                tokens = tokens.concat(temp);
                line = '';
                now = '';
                continue;
            }
            if (line == '' && wikitext.substring(i).startsWith('>') && (temp = blockquoteParser(wikitext, i, v => i = v))) {
                tokens = tokens.concat(temp);
                line = '';
                now = '';
                continue;
            }
            for(let bracket of multiBrackets) {
                if(wikitext.substring(i).startsWith(bracket.open) && (temp = bracketParser(wikitext, i, bracket, v => i = v, callProcessor))){ // TO-DO r(n) = processor
                    tokens = tokens.concat([{name: "wikitext", treatAsLine: true, text:line}], temp);
                    line = '';
                    now = '';
                    break;
                }
            }
            if(now === '\n') {
                tokens = tokens.concat([{name: "wikitext", treatAsLine: true, text:line}]);
                line = '';
            } else
                line += now;
        }
        if(line.length != 0)
            tokens = tokens.concat([{name: "wikitext", treatAsLine: true, text:line}]);
        function processTokens(_p) {
            let newarr = JSON.parse(JSON.stringify(_p));
            for(let i = 0; i < newarr.length; i++) {
                let v = newarr[i];
                if(v.constructor.name === "Array")
                    processTokens(v);
                else if(v.name !== "wikitext")
                    renderer.processToken(v);
                else if(v.parseFormat || v.treatAsBlock)
                    processTokens(blockParser(v.text));
                else if(v.treatAsLine)
                    processTokens(lineParser(v.text));
            }
        }
        setImmediate(() => {processTokens(tokens); renderer.getResult((err, result) => {if(err)callback(err);else callback(null, result);})});
    }

    function callProcessor(processorName, args) {
        return require('./processors')[processorName](args[0], args[1], options)
    }

    function blockParser(line) { // = formatProcessor
        // NOTE : no attachment syntax support
        let result = [],
            {singleBrackets} = require('./rules'),
            plainTemp = "";
        for(let j = 0; j < line.length; j++) {
            const extImgPattern = new RegExp(`(https?:\\/\\/[^ \\n]+(?:\\??.)(?:${options.allowedExternalImageExts.join('|')}))(\\?[^ \n]+|)`, 'i'),
                extImgOptionPattern=/[&?](width|height|align)=(left|center|right|[0-9]+(?:%|px|))/;
            if(line.substring(j).startsWith('http') && extImgPattern.test(line) && extImgPattern.exec(line).index === 0) {
                let matches = extImgPattern.exec(line),
                    imgUrl = matches[1],
                    optionsString = matches[2],
                    optionMatches = extImgOptionPattern.exec(optionsString);
                
                let styleOptions = {};
                for(let k = 1; k < optionMatches.length; k++) {
                    let optionMatch = optionMatches[k];
                    styleOptions[optionMatch[1]] = optionMatch[2];
                }
                if(plainTemp.length !== 0) {
                    result.push({name: "plain", text: plainTemp})
                    plainTemp = "";
                }
                result.push({name: "external-image", style: styleOptions, target: imgUrl});
                j += matches[0].length - 1;
                continue;
            } else {
                let nj = JSON.parse(JSON.stringify(j)), matched = false;
                for(let k = 0; k < singleBrackets.length; k++) {
                    let bracket = singleBrackets[k], temp = null, innerStrLen = null;
                    if(line.substring(j).startsWith(bracket.open) && (temp = bracketParser(line, nj, bracket, v => nj = v, callProcessor, v => innerStrLen = v))){ // TO=DO : r(n) = call processor
                        if(plainTemp.length !== 0) {
                            result.push({name: "plain", text: plainTemp})
                            plainTemp = "";
                        }
                        result = result.concat(temp);
                        j += innerStrLen - 1;
                        matched = true;
                        break;
                    }
                }
                if(!matched) {
                    if(line[j] == '\n') {
                        result.push({name: "plain", text: plainTemp})
                        plainTemp = "";
                    } else {
                        plainTemp += line[j];
                    }
                }
            }
        }
        if(plainTemp.length != 0) {
            result.push({name: "plain", text: plainTemp});
            plainTemp = '';
        }
        return result;
    }

    function lineParser(line) {
        let result = [];
        const { headings }= require('./rules')

        // comment
        if(line.startsWith('##'))
            return [{name: "comment", text:line.substring(2)}];

        // title
        if(line.startsWith('=')) {
            for (let patternString in headings) {
                let pattern = new RegExp(patternString);
                if(pattern.test(line)) {
                    let level = headings[patternString];
                    return [{name: "heading-start", level: level}, {name: "wikitext", treatAsBlock: true, text: pattern.exec(line)[1]}, {name: "heading-end"}];
                }
            } 
        }

        // hr
        if(!/[^-]/.test(line) && line.length >= 4 && line.length <= 10) {
            return [{name: "horizontal-line"}];
        }

        if(line.length != 0)
            return [{name: "paragraph-start"}, blockParser(line), {name: "paragraph-end"}];
        else
            return [];
    }
    this.parse = c => {setImmediate(() => doParse(c))};
    this.setIncluded = () => {options.included = true;};
    this.setIncludeParameters = (paramsObj) => {options.includeParameters = paramsObj;};
    this.setRenderer = (r = null, o = null) => {if(r!==null)rendererClass = r; if(o!==null)rendererOptions = o; return;}
}
module.exports = Namumark;