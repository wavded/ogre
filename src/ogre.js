var express = require('express'),
    ogre_engine = require('./engine'),
    connect = require('connect'),
    ejs = require('ejs');
    
var app = null;
    
exports.createServer = function(port,maxBuffer){
    app = express.createServer();
    port || (port = 3000);
    
    if(maxBuffer) ogre_engine.setMaxBuffer(maxBuffer);
    
    app.configure(function(){
        app.use(connect.staticProvider(__dirname + '/public'))
    });

    app.set('view engine', 'ejs')
    app.set('views', __dirname + '/views')

    app.get('/', function(req, res){
        res.render('home')
    })

    app.post('/convert', function(req, res){
        ogre_engine.upload(req,
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
    
    return true;
}
