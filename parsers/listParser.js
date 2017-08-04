let listTags = require('../rules').listTags,
    seekEOL = require('../helpers').seekEOL;

function finishTokens(tokens) {
    let result = [],
        prevListLevel = 0,
        prevIndentLevel = 0,
        prevWasList = false,
        prevListType;
    for (let i = 0; i < tokens.length; i++) {
        let curToken = tokens[i];
        let curWasList = curToken.name === 'list-item-temp';
        if (curWasList != prevWasList) {
            for (let j = 0; j < prevWasList ? prevListLevel : prevIndentLevel; j++)
                result.push({
                    name: prevWasList ? "list-end" : "indent-end"
                });
            if (prevWasList) prevListLevel = 0;
            else prevIndentLevel = 0;
        }
        switch (curToken.name) {
            case 'list-item-temp':
                if (prevListLevel < curToken.level) {
                    for (let j = 0; j < curToken.level - prevListLevel; j++)
                        result.push({
                            name: "list-start",
                            listType: curToken.listType
                        })
                } else if (prevListLevel > curToken.level) {
                    for (let j = 0; j < prevListLevel - curToken.level; j++)
                        result.push({
                            name: "list-end"
                        });
                } else if (prevListType.ordered !== curToken.listType.ordered || prevListType.type !== curToken.listType.type) {
                    result.push({
                        name: "list-end"
                    });
                    result.push({
                        name: "list-start",
                        listType: curToken.listType
                    });
                }
                prevListLevel = curToken.level;
                prevListType = curToken.listType;
                result.push({
                    name: "list-item-start",
                    startNo : curToken.startNo ? curToken.startNo : null
                });
                result.push({
                    name: "wikitext",
                    treatAsBlock: true,
                    text: curToken.wikitext
                });
                result.push({
                    name: "list-item-end"
                });
                break;
            case 'indent-temp':
                if (prevIndentLevel < curToken.level) {
                    for (let j = 0; j < curToken.level - prevIndentLevel; j++)
                        result.push({
                            name: "indent-start"
                        })
                } else if (prevIndentLevel > curToken.level) {
                    for (let j = 0; j < prevIndentLevel - curToken.level; j++)
                        result.push({
                            name: "indent-end"
                        });
                }
                prevIndentLevel = curToken.level;
                result.push({
                    name: "wikitext",
                    treatAsBlock: true,
                    text: curToken.wikitext
                });
        }
        if (i === tokens.length - 1) {
            if (curWasList) {
                for (let j = 0; j < prevListLevel; j++)
                    result.push({
                        name: "list-end"
                    });
            } else {
                for (let j = 0; j < prevIndentLevel; j++)
                    result.push({
                        name: "indent-end"
                    });
            }
        }
        prevWasList = curWasList;
    }
    return result;
}
module.exports = (wikitext, pos, setpos) => {
    let lineStart = pos,
        result = [],
        i;
    for (i = lineStart; i++; i < wikitext.length) {
        let char = wikitext[i];
        if (result.length === 0 && char === null)
            return null;
        if (char != ' ') {
            if (lineStart === i)
                break;
            let level = i - lineStart,
                matched = false,
                eol = seekEOL(wikitext, i),
                innerString = wikitext.substring(i, eol);
            for (let j in listTags) {
                let listTagInfo = listTags[j];
                innerString = wikitext.substring(i + j.length, eol);
                let startNoSpecifiedPattern = new RegExp(j.replace(/\./g, '\\.').replace(/\*/g, '\\*') + '#([0-9]+)'); // 1.#32 와 같이 시작번호를 지정하는 문법
                if (wikitext.substring(i).startsWith(j)) {
                    matched = true;
                    if (startNoSpecifiedPattern.test(wikitext.substring(i))) {
                        let startNo = parseInt(startNoSpecifiedPattern.exec(wikitext.substring(i))[1]);
                        innerString = innerString.replace(/^#[0-9]+/, '');
                        result.push({
                            name: "list-item-temp",
                            listType: listTagInfo,
                            level: level,
                            startNo: startNo,
                            wikitext: innerString
                        });
                    } else {
                        result.push({
                            name: "list-item-temp",
                            listType: listTagInfo,
                            level: level,
                            wikitext: innerString
                        });
                    }
                    i = eol;
                    lineStart = eol + 1;
                    break;
                }
            }
            if (!matched) {
                result.push({
                    name: "indent-temp",
                    level: level,
                    wikitext: innerString
                });
                i = eol;
                char = "\n";
            }
        }
        if (char == '\n')
            lineStart = i + 1;
    }
    if (result.length === 0)
        result = null;
    else{
        result = finishTokens(result);
        setpos(i - 2);
    }
    return result;
}