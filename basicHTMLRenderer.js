const encodeHTMLComponent = require('htmlspecialchars');

function HTMLRenderer() {
    let resultTemp = [],
        headings = [],
        footnotes = [],
        categories = [],
        isHeadingNow = false,
        isFootnoteNow = false,
        lastHeadingLevel = 0,
        footnoteCount = 0,
        lastListOrdered = [],
        wasPreMono = false;
    function appendResult(value) {
        if(isFootnoteNow) {
            footnotes[footnotes.length - 1].value += typeof value === "string" ? value : value.toString();
            return;
        } else if(isHeadingNow) {
            headings[headings.length - 1].value += typeof value === "string" ? value : value.toString();
        }
        if(resultTemp.length === 0)
            resultTemp.push(value);
        else {
            let isArgumentString = typeof value === "string";
            let isLastItemString = typeof resultTemp[resultTemp.length - 1] === "string";
            if(isArgumentString && isLastItemString) {
                resultTemp[resultTemp.length - 1] += value;
            } else {
                resultTemp.push(value);
            }
        }
    }
    this.processToken = (i) => {
        console.log(i);
        switch (i.name) {
            case 'blockquote-start':
                appendResult('<blockquote>');
                break;
            case 'blockquote-end':
                appendResult('</blockquote>');
                break;
            case 'list-start':
                lastListOrdered.push(i.listType.ordered);
                appendResult(`<${i.listType.ordered ? 'ol' : 'ul'}${i.listType.type ? ` class="${i.listType.type}"` : ''}>`);
                break;
            case 'list-end':
                appendResult(`</${lastListOrdered.pop() ? 'ol' : 'ul'}>`);
                break;
            case 'indent-start':
                appendResult('<div class="wiki-indent">');
                break;
            case 'indent-end':
                appendResult('</div>');
                break;
            case 'list-item-start':
                appendResult(i.startNo ? `<li value=${i.startNo}>` : '<li>');
                break;
            case 'list-item-end':
                appendResult('</li>');
                break;
            case 'table-start':
                appendResult(`<table${i.options > 0 ? " style=\"" + ObjToCssString(i.options) +'"' : ''}>`);
                break;
            case 'table-col-start':
                appendResult(`<td${i.options > 0 ? " style=\"" + ObjToCssString(i.options) +'"' : ''}${i.colspan > 0 ? ` colspan=${i.colspan}` : ''}${i.rowspan ? ` rowspan=${i.rowspan}` : ''}>`);
                break;
            case 'table-col-end':
                appendResult('</td>');
                break;
            case 'table-row-end':
                appendResult('</tr>');
                break;
            case 'table-row-start':
                appendResult(`<tr${i.options ? " style=\"" + ObjToCssString(i.options) +'"' : ''}>`);
                break;
            case 'table-end':
                appendResult('</table>');
                break;
            case 'closure-start':
                appendResult('<div class="wiki-closure">');
                break;
            case 'closure-end':
                appendResult('</div>');
                break;
            case 'link-start':
                appendResult(`<a href="${i.internal ? `/wiki/${i.target}` : i.target}" class="${i.internal ? 'wiki-internal-link' : ''}${i.external ? 'wiki-external-link' : ''}">`);
                break;
            case 'link-end':
                appendResult('</a>');
                break;
            case 'plain':
                appendResult(encodeHTMLComponent(i.text));
                break;
            case 'add-category':
                categories.push(i.categoryName);
                break;
            case 'image':
                appendResult(`<img src="/wiki-image/${i.target}"${i.fileOpts ? ` style=${ObjToCssString(i.fileOpts)}` : ''}></img>`)
                break;
            case 'footnote-start':
                let fnNo = ++footnoteCount;
                appendResult(`<a href="#fn-${fnNo}" id="afn-${fnNo}" class="footnote"><sup class="footnote-sup">[${i.supText ? i.supText : fnNo}] `)
                footnotes.push({sup: i.supText, value: ''});
                isFootnoteNow = true;
                break;
            case 'footnote-end':
                isFootnoteNow = false;
                appendResult('</sup></a>');
                break;
            case 'macro':
                switch (i.macroName) {
                    case 'br':
                        appendResult('<br>');
                        break;
                    case 'date':
                        appendResult(Date.toString());
                        break;
                    case 'youtube':
                        if (i.options.length == 0) {
                            appendResult('<strong style="color: red; border: 1px solid red;">오류 : youtube 동영상 ID가 제공되지 않았습니다!</strong>')
                        } else if (i.options.length >= 1) {
                            if (typeof i.options[0] === 'string')
                                if (i.options.length == 1)
                                    appendResult(`<iframe src="//www.youtube.com/embed/${i.options[0]}"></iframe>`)
                            else
                                appendResult(`<iframe src="//www.youtube.com/embed/${i.options[0]}" style="${ObjToCssString(i.options.slice(1))}"></iframe>`)
                            else
                                appendResult('<strong style="color: red; border: 1px solid red;">오류 : youtube 동영상 ID는 첫번째 인자로 제공되어야 합니다!</strong>')
                        }
                        break;
                    case '각주':
                    case 'footnote':
                    case 'footnotes':
                        let footnoteContent = '';
                        for(let j = 0; j < footnotes.length; j++) {
                            let footnote = footnotes[j];
                            footnoteContent += `<a href="#afn-${j+1}" id="fn-${j+1}" class="footnote"><sup class="footnote-sup">[${footnote.sup ? footnote.sup : j+1}]</sup></a> ${footnote.value}<br>`
                        }
                        footnotes = [];
                        appendResult(footnoteContent);
                        break;
                    case '목차':
                    case 'tableofcontents':
                    case 'toc':
                        appendResult({name: 'macro', macroName: i.macroName});
                        break;
                    default:
                        appendResult('[Unsupported Macro]');
                        break; // 목차, tableofcontents, toc, 각주, footnote, include
                }
                break;
            case 'monoscape-font-start':
                wasPreMono = i.pre;
                appendResult((wasPreMono ? '<pre>' : '') + '<code>');
                break;
            case 'monoscape-font-end':
                appendResult('</code>' + (wasPreMono ? '</pre>' : ''));
                break;
            case 'strong-start':
                appendResult('<strong>');
                break;
            case 'italic-start':
                appendResult('<em>');
                break;
            case 'strike-start':
                appendResult('<del>');
                break;
            case 'underline-start':
                appendResult('<u>');
                break;
            case 'superscript-start':
                appendResult('<sup>');
                break;
            case 'subscript-start':
                appendResult('<sub>');
                break;
            case 'strong-end':
                appendResult('</strong>');
                break;
            case 'italic-end':
                appendResult('</em>');
                break;
            case 'strike-end':
                appendResult('</del>');
                break;
            case 'underline-end':
                appendResult('</u>');
                break;
            case 'superscript-end':
                appendResult('</sup>');
                break;
            case 'subscript-end':
                appendResult('</sub>');
                break;
            case 'unsafe-plain':
                appendResult(i.text);
                break;
            case 'font-color-start':
                appendResult(`<span style="color: ${i.color}>`);
                break;
            case 'font-size-start':
                appendResult(`<span class="wiki-size-${i.level}-level">`);
                break;
            case 'font-color-end':
            case 'font-size-end':
                appendResult('</span>');
                break;
            case 'external-image':
                appendResult(`<img src="${i.target}" ${i.styleOptions ? "style=\"" + ObjToCssString(i.styleOptions) + '"' : ''}/>`)
                break;
            case 'comment':
                break; // 신경쓸 필요 X
            case 'heading-start':
                lastHeadingLevel = i.level;
                appendResult(`<h${i.level}>`);
                isHeadingNow = true;
                headings.push({level: i.level, value: ''});
                break;
            case 'heading-end':
                isHeadingNow = false;
                appendResult(`</h${lastHeadingLevel}>`);
                break;
            case 'horizontal-line':
                appendResult('<hr>');
                break;
            case 'paragraph-start':
                appendResult('<p>');
                break;
            case 'paragraph-end':
                appendResult('</p>');
        }
    }
    function finalLoop() {
        result = '';
        for(let i = 0; i < resultTemp.length; i++) {
            let item = resultTemp[i];
            if(typeof item === "string")
                result += item;
            else if(item.name === "macro") {
                switch(item.macroName) {
                    case 'toc':
                    case 'tableofcontents':
                    case '목차':
                        let macroContent = '<div class="wiki-toc"><div class="wiki-toc-heading">목차</div>';
                        for(let j = 0; j < headings.length; j++) {
                            macroContent += `<div class="wiki-toc-item wiki-toc-item-indent-${headings[j].level}">${headings[j].value}</div>`;
                        }
                        macroContent += '</div></div>';
                        result += macroContent;
                        break;
                    case 'include':
                        result += 'NO INCLUDE SUPPORT ON RENDERER LEVEL';
                }
            }
        }
        return result;
    }
    this.getResult = () => {
        return {html: finalLoop(), categories: categories};
    }
}

module.exports = HTMLRenderer;