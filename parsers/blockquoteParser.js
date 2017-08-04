let {seekEOL} = require('../helpers');
module.exports = (wikitext, pos, setpos) => {
    let i, temp = [], result = [];
    for(i = pos; i < wikitext.length; i = seekEOL(wikitext, i)+1) {
        let eol = seekEOL(wikitext, i);
        if(!wikitext.substring(i).startsWith(">"))
            break;
        let level = /^>+/.exec(wikitext)[0].length,
            line = wikitext.substring(i + level, eol);
        temp.push({level: level, line: line});
    }
    if(temp.length == 0)
        return null;
    let curLevel = 1;
    result.push({name: "blockquote-start"})
    for(let i = 0; i < temp.length; i++) {
        let curTemp = temp[i];
        if(curTemp.level > curLevel) {
            for(let i = 0; i < curTemp.level - curLevel; i++)
                result.push({name: "blockquote-start"});
        } else if (curTemp.level < curLevel) {
            for(let i = 0; i < curLevel - curTemp.level; i++)
                result.push({name: "blockquote-end"});
        }
        result.push({name: "wikitext", parseFormat: true, text: curTemp.line});
    }
    result.push({name: "blockquote-end"});
    setpos(i - 1);
    return result;
};