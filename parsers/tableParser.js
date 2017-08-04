const extend = require('extend');

function parseOptionBracket(optionContent) {
    let colspan = 0, rowspan = 0, colOptions = {}, tableOptions = {}, rowOptions = {}, matched = false;
    if (/^-[0-9]+$/.test(optionContent)) {
        // 가로 합치기
        colspan += parseInt(/^-([0-9]+)$/.exec(optionContent)[1]);
        matched = true;
    } else if (/^\|[0-9]+$/.test(optionContent) || /^\^\|([0-9]+)$/.test(optionContent) || /^v\|([0-9]+)$/.test(optionContent)) {
        // 세로 합치기
        rowspan += parseInt(/^\|([0-9]+)$/.exec(optionContent)[1] || /^\^\|([0-9]+)$/.exec(optionContent)[1] || /^v\|([0-9]+)$/.exe(optionContent)[1]);
        matched = true;
        if (/^\^\|([0-9]+)$/.test(optionContent))
            colOptions["vertical-align"] = "top";
        else if (/^v\|([0-9]+)$/.test(optionContent))
            colOptions["vertical-align"] = "bottom";
        else if (/^\|([0-9]+)$/.test(optionContent))
            colOptions["vertical-align"] = "middle";
    } else if (optionContent.startsWith("table ")) {
        // 테이블 설정
        let tableOptionContent = optionContent.substring(6);
        let tableOptionPatterns = {
            "align": /^align=(left|center|right)$/,
            "background-color": /^bgcolor=(#[a-zA-Z0-9]{3,6}|[a-zA-Z]+)$/,
            "border-color": /^bordercolor=(#[a-zA-Z0-9]{3,6}|[a-zA-Z]+)$/,
            "width": /^width=([0-9]+(?:in|pt|pc|mm|cm|px))$/
        };
        for (let optionName in tableOptionPatterns) {
            if (tableOptionPatterns[optionName].test(tableOptionContent)) {
                tableOptions[optionName] = tableOptionPatterns[optionName].exec(tableOptionContent)[1];
                matched = true;
            }
        }
    } else {
        // 셀 옵션 패턴 (매개변수 X)
        let textAlignCellOptions = {
            "left": /^\($/,
            "middle": /^:$/,
            "right": /^\)$/
        };
        // 셀 옵션 패턴 (매개변수 O)
        let paramlessCellOptions = {
            "background-color": /^bgcolor=(#[0-9a-zA-Z]{3,6}|[a-zA-Z0-9]+)$/,
            "row-background-color": /^rowbgcolor=(#[0-9a-zA-Z]{3,6}|[a-zA-Z0-9]+)$/,
            "width": /^width=([0-9]+(?:in|pt|pc|mm|cm|px|%))$/,
            "height": /^height=([0-9]+(?:in|pt|pc|mm|cm|px|%))$/
        }
        for (let i in textAlignCellOptions) {
            if (textAlignCellOptions[i].test(optionContent)) {
                colOptions["text-align"] = optionContent;
                matched = true;
            }
            else
                for (let optionName in paramlessCellOptions) {
                    if(!paramlessCellOptions[optionName].test(optionContent))
                        continue;
                    if(optionName.startsWith("row-"))
                        rowOptions[optionName.substring(4)] = paramlessCellOptions[optionName].exec(optionContent)[1];
                    else
                        colOptions[optionName] = paramlessCellOptions[optionName].exec(optionContent)[1];
                    matched = true;
                }
        }
    }
    // colspan_add = 0, rowspan_add = 0, colOptions = {}, tableOptions = {};
    return {colspan_add: colspan, rowspan_add: rowspan, colOptions_set: colOptions, rowOptions_set: rowOptions, tableOptions_set: tableOptions, matched: matched};
};
module.exports = (wikitext, pos, setpos) => {
    // 시발 표 존나 복잡하네
    // 버그 : || 2행이 {{{ || }}} 되어야 하는데 || 3행으로 됨 ㅋ ||
    let caption = null;
    if (!wikitext.substring(pos).startsWith('||')) {
        caption = wikitext.substring(pos + 1, wikitext.indexOf('|', pos + 2));
        pos = wikitext.indexOf('|', pos + 1) + 1;
        console.log(caption);
    } else {
        pos += 2;
    }
    let cols = wikitext.substring(pos).split('||'),
        rowno = 0,
        hasTableContent = false,
        colspan = 0,
        rowspan = 0;
    let optionPattern = /<(.+?)>/;
    console.log(cols);
    let table = {
        0: []
    };
    let tableOptions = {};
    // parse cols, result= {wikitext, options, rowOptions} => table
    let i;
    if(cols.length < 2)
        return null;
    for (i = 0; i < cols.length; i++) {
        let col = cols[i],
            curColOptions = {},
            rowOption = {};
        if (col.startsWith('\n') && col.length > 1) {
            // table end
            break;
        }
        if (col == '\n') {
            // new row
            table[++rowno] = [];
            continue;
        }
        if (col.length == 0) {
            // 이런 형식의 열 합치기 : |||||| 합쳐진 열 ||
            colspan++;
            continue;
        }
        if (col.startsWith(' ') && !col.endsWith(' '))
            curColOptions["text-align"] = "left"
        else if (!col.startsWith(' ') && col.endsWith(' '))
            curColOptions["text-align"] = "right"
        else if (col.startsWith(' ') && col.endsWith(' '))
            curColOptions["text-align"] = "middle"
        while (optionPattern.test(col)) {
            // 옵션이 존재함.
            let match = optionPattern.exec(col);
            if (match.index != 0)
                break; // 옵션이 아님 ||<|2> 이건 옵션이지만 || <|2> 이렇게 중간에 뭐라도 있으면 옵션으로 간주 안함. (더시드위키 테스트 결과)
            let optionContent = match[1];
            let {colOptions_set, tableOptions_set, colspan_add, rowspan_add, rowOptions_set, matched} = parseOptionBracket(optionContent);
            curColOptions = extend(true, curColOptions, colOptions_set);
            tableOptions = extend(true, tableOptions, tableOptions_set);
            rowOptions_set = extend(true, rowOption, rowOptions_set);
            colspan += colspan_add;
            rowspan += rowspan_add;

            if (tableOptions["border-color"]) {
                tableOptions["border"] = `2px solid ${tableOptions["border-color"]}`;
                delete tableOptions["border-color"];
            }
            //if (matched) {
                col = col.substring(match[0].length);
            //}
        }
        let colObj = {options: curColOptions, colspan: colspan, rowspan: rowspan, rowOption: rowOption, wikitext: col};
        colspan = 0; rowspan = 0;
        table[rowno].push(colObj);
        hasTableContent = true;
    }
    // gen row options
    let rowOptions = [];
    for (let j = 0; j < table.length; j++) {
        let rowOption = {};
        for(let k = 0; k < table[j].length; k++) {
            rowOption = extend(true, rowOption, table[j].rowOption);
        }
        rowOption.push(rowOption);
    }
    // return as tokens
    let result = [{name:"table-start", options: tableOptions}];
    let rowCount = Object.keys(table).length;
    for (let j = 0; j < rowCount; j++) {
        result.push({name: "table-row-start", options: rowOptions[j]});
        for(let k = 0; k < table[j].length; k++) {
            result.push({name: "table-col-start", options: table[j][k].options, colspan: table[j][k].colspan, rowspan: table[j][k].rowspan});
            result.push({name: "wikitext", text: table[j][k].wikitext, treatAsLine: true});
            result.push({name: "table-col-end"});
        }
        result.push({name:"table-row-end"});
    }
    result.push({name:"table-end"});
    if(hasTableContent) {
        setpos(pos + cols.slice(0, i).join('||').length + 1)
        return result;
    } else {
        return null;
    }
};