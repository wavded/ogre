var app = require('express').createServer(),
    ogre = require('./src/ogre'),
    connect = require('connect'),
    ejs = require('ejs'),
    port = process.argv[2] || 3000;

app.configure(function(){
    app.use(connect.staticProvider(__dirname + '/public'))
});

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

app.get('/', function(req, res){
    res.render('home')
})

app.post('/convert', function(req, res){
    ogre.upload(req,
        function(outputstream,contentType,launchViewer){
            if(launchViewer)
                res.render('viewer', {
                    locals: {
                        output: outputstream
                    }
                })
            else {
                res.header("Content-Type",contentType)
                res.send(outputstream)
            }
        }
    )
})

app.error(function(err, req, res, next){
    res.send(err.message, 500)
})

app.listen(port);

console.log("Ogre started, listening on port " + port);

