var app = require('express').createServer(),
    helper = require('./helper'),
    connect = require('connect'),
    ejs = require('ejs');

app.configure(function(){
    app.use(connect.staticProvider(__dirname + '/public'));
});

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
    res.render('home')
})

app.post('/convert', function(req, res){
    helper.upload(req,function(outputstream){
        if(outputstream){
            res.header("Content-Type","application/json")
            res.send(outputstream) }
        else res.send("Unable to perform transformation")
    })
})

app.error(function(err, req, res, next){
    res.send(err.message, 500)
})

app.listen(3000);

