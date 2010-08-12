var app = require('express').createServer(),
    helper = require('./helper'),
    connect = require('connect'),
    ejs = require('ejs')

app.configure(function(){
    app.use(connect.staticProvider(__dirname + '/public'))
});

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

app.get('/', function(req, res){
    res.render('home')
})

app.post('/convert', function(req, res){
    helper.upload(req,
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

app.listen(4356);

