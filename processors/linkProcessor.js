module.exports = (text, type, configs) => {
    let href = text.split('|');
    if (/^https?:\/\//.test(text)) {
        return [{
            name: "link-start",
            external: true,
            target: href[0]
        }, {
            name: href.length > 1 ? "wikitext" : "plain",
            parseFormat: true,
            text: href.length > 1 ? href[1] : href[0]
        }, {
            name: "link-end"
        }];
    } else if (/^분류:(.+)$/.test(href[0])) {
        let category = /^분류:(.+)$/.exec(href[0])[1];
        if (!configs.included)
            return [{
                name: "add-category",
                blur: href[0].endsWith('#blur'),
                categoryName: category
            }];
    } else if (/^파일:(.+)$/.test(href[0])) {
        let fileOpts = {},
            haveOpts = false;
        if (href.length > 1) {
            let pattern = /[&?]?(^[=]+)=([^\&]+)/g,
                match = null;
            while (match = pattern.exec(href[1])) {
                if ((match[1] === 'width' || match[1] === 'height') && /^[0-9]$/.test(match[2])) {
                    match[2] = match[2] + 'px';
                }
                fileOpts[match[1]] = match[2];
                haveOpts = true;
            }
        }
        if (haveOpts) {
            return [{
                name: "image",
                target: /^파일:(.+)$/.exec(href[0])[1]
            }];
        } else {
            return [{
                name: "image",
                target: /^파일:(.+)$/.exec(href[0])[1],
                options: fileOpts
            }];
        }
    } else {
        if (href[0].startsWith(' ') || href[0].startsWith[':']) {
            href[0] = href[0].substring(1);
        }
        return [{
            name: "link-start",
            internal: true,
            target: href[0]
        }, href.length > 1 ? {
            name: "wikitext",
            parseFormat: true,
            text: href[1]
        } : {
            name: "plain",
            text: href[0]
        }, {
            name: "link-end"
        }];
    }
};