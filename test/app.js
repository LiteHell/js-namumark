#!node

const fs = require('fs'),
    Namumark = require(__dirname + '/../'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

let doc = {
    exists: (name) => fs.existsSync(`${__dirname}/docs/${encodeURIComponent(name)}`),
    write: (name, wikitext) => fs.writeFileSync(`${__dirname}/docs/${encodeURIComponent(name)}`, wikitext, {
        encoding: 'utf8'
    }),
    read: (name) => doc.exists(name) ? fs.readFileSync(`${__dirname}/docs/${encodeURIComponent(name)}`, {
        encoding: 'utf8'
    }) : ''
}
app.use(express.static(__dirname + '/static'))
app.get('/', (req, res) => {
    if (doc.exists('MainPage'))
        res.redirect('/wiki/MainPage');
    else
        res.redirect('/edit/MainPage')
});
app.get('/edit/:name', (req, res) => {
    let name = req.params.name;
    res.render('edit', {
        name: name,
        wikitext: doc.exists(name) ? doc.read(name) : '' 
    });
})
app.post('/edit/:name', bodyParser.urlencoded({
    limit: 999999999999,
    type: 'application/x-www-form-urlencoded'
}), (req, res) => {
    let wikitext = req.body.wikitext.replace(/\r\n/g, '\n');
    let name = req.params.name;
    doc.write(name, wikitext);
    res.redirect(`/wiki/${name}`);
});
app.get('/wiki/:name', (req, res) => {
    let name = req.params.name;
    if(!doc.exists(name))
        return res.redirect(`/edit/${name}`);
    let namumark = new Namumark(name, {
        wiki: doc
    });
    namumark.parse((renderResults) => {
        let {
            html,
            categories
        } = renderResults;
        res.render('wiki', {
            title: name,
            //parseResult: require('util').inspect(parseResult, {showHidden: false, depth: null, maxArrayLength: null}),
            renderResult: html,
            categoires: categories
        });
    });
});
if (!fs.existsSync(__dirname + '/docs'))
    fs.mkdir(__dirname + '/docs');
app.listen(3132, () => {
    console.log('listening on port 3132');
})