module.exports = (wikitext, pos, bracket, setpos, callproc, matchLenCallback = null) => {
    let cnt = 0, done = false;
    for(let i = pos; i < wikitext.length; i++) {
        if (wikitext.substring(i).startsWith(bracket.open) && !(bracket.open == bracket.close && cnt > 0)) {
            cnt++;
            done = true;
            i += bracket.open.length - 1;
        } else if(wikitext.substring(i).startsWith(bracket.close)) {
            cnt--;
            i += bracket.close.length - 1;
        } else if(!bracket.multiline && wikitext[i] === '\n')
            return null;
        
        if(cnt == 0 && done) {
            let innerString = wikitext.substring(pos + bracket.open.length, i - bracket.close.length + 1);
            if(matchLenCallback) {
                matchLenCallback(innerString.length + bracket.open.length + bracket.close.length);
            }
            setpos(i);
            return callproc(bracket.processor, [innerString, bracket.open]);
        }
    }
    return null;
}