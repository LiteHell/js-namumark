module.exports = {
    "wiki": {
        "read": (docName) => null // return null if not found, return content if found
    },
    "allowedExternalImageExts": ["jpg", "jpeg", "png", "gif"],
    "included": false,
    "macroNames": ["br", "date", "목차", "tableofcontents", "각주", "footnote", "toc", "youtube", "include"],
    "processIncludeOnParser": false // if false, include macro will processed as {name: "macro", macroName: "include", params: ["docName"]}
}