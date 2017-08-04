#!node

const fs = require('fs'),
    Namumark = require(__dirname + '/../'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/write', (req, res) => {
    res.redirect('/');
})
app.post('/write', bodyParser.urlencoded({
    limit: 999999999999,
    type: 'application/x-www-form-urlencoded'
}), (req, res) => {
    let wikitext = req.body.wikitext.replace(/\r\n/g, '\n');
    fs.writeFileSync(`${__dirname}/docs/${encodeURIComponent(req.body.title)}`, wikitext, {
        encoding: 'utf8'
    });
    let namumark = new Namumark(req.body.title, {
        wiki: {
            read: (name) => {
                if (fs.existsSync(`${__dirname}/docs/${encodeURIComponent(req.body.title)}`))
                    return fs.readFileSync(`${__dirname}/docs/${encodeURIComponent(req.body.title)}`, {
                        encoding: 'utf8'
                    });
                else
                    return '';
            }
        }
    });
    namumark.parse((parseResult) => {
        let renderResult = req.body.render === 'yes' ? Namumark.Renderers.BasicHTML(parseResult) : null;
        res.render('result', {
            title: req.body.title,
            parseResult: require('util').inspect(parseResult, {showHidden: false, depth: null, maxArrayLength: null}),
            renderResult: renderResult
        });
    });
});
if (!fs.existsSync(__dirname + '/docs'))
    fs.mkdir(__dirname + '/docs');
app.listen(3132, () => {
    console.log('listening on port 3132');
})