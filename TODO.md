- Heading
- Redirect
- Decoration
  - Bold
  - Italic
  - strike (`~~ --`)
  - underline
  - superscript
  - subscript
- font-size
- color
- nowiki
- hyperlink
  - simple
  - different ouput (`[[a|b]]`)
  - To parent/child document (`[[../] [[/a]]]`)
  - To external image
  - **NOTE** : wiki markup can be applied to link output
- macros
  - anchor
  - youtube
  - date
  - br
  - include
  - toc
  - references
  - age
  - dday
- image
  - size and align (`[[파일:example.jpg|width=300&height=300&align=left]])`
- list
  - unordered (`*`)
  - ordered (`1. A. a. I. i.`)
  - specify start number (`I.#42 example`)
- reference (`a[* b] a[*ref c]`)
- indent
- blockquote (`>example`)
- hr (4~9)
- comment (`## skipped`)
- table
  - colspan (`|||a|| ||<-2> a||`)
  - rowspan (`||<|4> a||)
  - decoration
    - table
      - align (`<table algin=left>`)
      - background color(`<table bgcolor=#aaaaaa>`)
      - border color(`<table bordercolor=#aaaaaa>`)
      - width (`<table width=40%>`)
    - cell
      - align (`<(> <:> <)>`) (`||Left || Center || Right||`)
      - vertical align (`<^|number> <|number> <v|number>`)
      - cell background color(`<bgcolor=#aaaaaa>`)
      - width (`<width=300px>`)
      - height (`<height=300px>`)
    - caption (`|caption| cell 1 || cell 2 ||`)
- math (`<math>latex here</math>`)
- html (`{{{#!html example}}}`)
- wiki closure
```
{{{#!wiki style="style"
ddd}}}
```
- syntax highlighting
```
{{{#!syntax lang name
code
}}}
```
- category