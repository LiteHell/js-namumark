const encodeHTMLComponent = require('htmlspecialchars');
module.exports = (tokens) => {
    return firstLoop(tokens);
}

function ObjToCssString(obj) {
    let result = '';
    for (let name in obj) {
        result += `${name}=${obj[name]};`;
    }
    return result;
}

// toc, footnote 매크로 처리하려면 secondLoop도 만들어야 하는데 귀찮음...
function firstLoop(tokens) {
    let result = '',
        lastListOrdered = [],
        lastHeadingLevel = 0,
        categories = [],
        currentFn = [],
        currentFnSupText = "",
        isFn = false,
        fns = [],
        wasPreMono = false;
    for (let k = 0; k < tokens.length; k++) {
        let i = tokens[k];
        function replaceCT(val) {
            console.log(val);
            result += val;
        }
        if(i.constructor.name === 'Array') {
            if(i.length == 0) continue;
            replaceCT(firstLoop(i));
        }
        switch (i.name) {
            case 'blockquote-start':
                replaceCT('<blockquote>');
                break;
            case 'blockquote-end':
                replaceCT('</blockquote>');
                break;
            case 'list-start':
                lastListOrdered.push(i.listType.ordered);
                replaceCT(`<${i.listType.ordered ? 'ol' : 'ul'}${i.listType.type ? ` class="${i.listType.type}"` : ''}>`);
                break;
            case 'list-end':
                replaceCT(`</${lastListOrdered.pop() ? 'ol' : 'ul'}>`);
                break;
            case 'indent-start':
                replaceCT('<div class="wiki-indent">');
                break;
            case 'indent-end':
                replaceCT('</div>');
                break;
            case 'list-item-start':
                replaceCT(i.startNo ? `<li value=${i.startNo}>` : '<li>');
                break;
            case 'list-item-end':
                replaceCT('</li>');
                break;
            case 'table-start':
                replaceCT(`<table${i.options > 0 ? " style=\"" + ObjToCssString(i.options) +'"' : ''}>`);
                break;
            case 'table-col-start':
                replaceCT(`<td${i.options > 0 ? " style=\"" + ObjToCssString(i.options) +'"' : ''}${i.colspan > 0 ? ` colspan=${i.colspan}` : ''}${i.rowspan ? ` rowspan=${i.rowspan}` : ''}>`);
                break;
            case 'table-col-end':
                replaceCT('</td>');
                break;
            case 'table-row-end':
                replaceCT('</tr>');
                break;
            case 'table-row-start':
                replaceCT(`<tr${i.options ? " style=\"" + ObjToCssString(i.options) +'"' : ''}>`);
                break;
            case 'table-end':
                replaceCT('</table>');
                break;
            case 'closure-start':
                replaceCT('<div class="wiki-closure">');
                break;
            case 'closure-end':
                replaceCT('</div>');
                break;
            case 'link-start':
                replaceCT(`<a href="${i.internal ? `/wiki/${i.target}` : i.target}" class="${i.internal ? 'wiki-internal-link' : ''}${i.external ? 'wiki-external-link' : ''}">`);
                break;
            case 'link-end':
                replaceCT('</a>');
                break;
            case 'plain':
                replaceCT(encodeHTMLComponent(i.text));
                break;
            case 'add-category':
                categories.push(i.categoryName);
                break;
            case 'image':
                replaceCT(`<img src="/wiki-image/${i.target}"${i.fileOpts ? ` style=${ObjToCssString(i.fileOpts)}` : ''}></img>`)
                break;
            case 'footnote-start':
                replaceCT(`<sup class="footnote-sup">[${i.supText ? i.supText : "주"}] `)
                break;
            case 'footnote-end':
                replaceCT('</sup>');
                break;
            case 'macro':
                switch (i.macroName) {
                    case 'br':
                        replaceCT('<br>');
                        break;
                    case 'date':
                        replaceCT(Date.toString());
                        break;
                    case 'youtube':
                        if (i.options.length == 0) {
                            replaceCT('<strong style="color: red; border: 1px solid red;">오류 : youtube 동영상 ID가 제공되지 않았습니다!</strong>')
                        } else if (i.options.length >= 1) {
                            if (typeof i.options[0] === 'string')
                                if (i.options.length == 1)
                                    replaceCT(`<iframe src="${i.options[0]}"></iframe>`)
                            else
                                replaceCT(`<iframe src="${i.options[0]}" style="${ObjToCssString(i.options.slice(1))}"></iframe>`)
                            else
                                replaceCT('<strong style="color: red; border: 1px solid red;">오류 : youtube 동영상 ID는 첫번째 인자로 제공되어야 합니다!</strong>')
                        }
                        break;
                    default:
                        replaceCT(`[매크로 ${i.macroName}]`);
                        break; // 목차, tableofcontents, toc, 각주, footnote, include
                }
                break;
            case 'monoscape-font-start':
                wasPreMono = i.pre;
                replaceCT((wasPreMono ? '<pre>' : '') + '<code>');
                break;
            case 'monoscape-font-end':
                replaceCT('</code>' + (wasPreMono ? '</pre>' : ''));
                break;
            case 'strong-start':
                replaceCT('<strong>');
                break;
            case 'italic-start':
                replaceCT('<em>');
                break;
            case 'strike-start':
                replaceCT('<del>');
                break;
            case 'underline-start':
                replaceCT('<u>');
                break;
            case 'superscript-start':
                replaceCT('<sup>');
                break;
            case 'subscript-start':
                replaceCT('<sub>');
                break;
            case 'strong-end':
                replaceCT('</strong>');
                break;
            case 'italic-end':
                replaceCT('</em>');
                break;
            case 'strike-end':
                replaceCT('</del>');
                break;
            case 'underline-end':
                replaceCT('</u>');
                break;
            case 'superscript-end':
                replaceCT('</sup>');
                break;
            case 'subscript-end':
                replaceCT('</sub>');
                break;
            case 'unsafe-plain':
                replaceCT(i.text);
                break;
            case 'font-color-start':
                replaceCT(`<span style="color: ${i.color}>`);
                break;
            case 'font-size-start':
                replaceCT(`<span class="wiki-size-${i.level}-level">`);
                break;
            case 'font-color-end':
            case 'font-size-end':
                replaceCT('</span>');
                break;
            case 'external-image':
                replaceCT(`<img src="${i.target}" ${i.styleOptions ? "style=\"" + ObjToCssString(i.styleOptions) + '"' : ''}/>`)
                break;
            case 'comment':
                break; // 신경쓸 필요 X
            case 'heading-start':
                lastHeadingLevel = i.level;
                replaceCT(`<h${i.level}>`);
                break;
            case 'heading-end':
                replaceCT(`</h${lastHeadingLevel}>`);
                break;
            case 'horizontal-line':
                replaceCT('<hr>');
                break;
            case 'paragraph-start':
                replaceCT('<p>');
                break;
            case 'paragraph-end':
                replaceCT('</p>');
        }
    }
    return result;
}