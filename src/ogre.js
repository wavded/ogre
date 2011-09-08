var express = require('express'),
    stylus = require('stylus'),
    nib = require('nib'),
    toJson = require('./convert-to-json'),
    fromJson = require('./convert-from-json');

var app = null;

exports.createServer = function(port,maxBuffer,gaCode){
    app = express.createServer();
    port || (port = 3000);

    if(maxBuffer) ogre_engine.setMaxBuffer(maxBuffer);

    function compile(str, path, fn) {
      return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib());
    };

    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.use(stylus.middleware({
            src: __dirname + '/views',
            dest: __dirname + '/public',
            compile: compile
        }));
        app.use(express.static(__dirname + '/public'))
    });

    app.get('/', function(req, res){
        res.render('home',{
            locals: {
                trackcode: gaCode || ''
            }
        });
    })

    app.post('/convert', function(req, res){
        toJson.upload(req,
            function(outputstream,contentType,launchViewer){
                if(launchViewer)
                    res.render('viewer', {
                        locals: {
                            output: outputstream,
                            trackcode: gaCode || ''
                        }
                    });
                else {
                    res.header("Content-Type",contentType);
                    res.send(outputstream);
                }
            }
        )
    })

    app.post('/convertJson', express.bodyParser(), function(req, res){
        outputName = (req.body.name || 'ogreToShape') + '.zip';
        fromJson.upload(req,
            function(err, outputZipFile){
                if(err){
                    res.send(err);
                } else {
                    res.download(outputZipFile, outputName, function(err){
                        fromJson.removeOutputFile(outputZipFile);
                    });
                }
            }
        )
    })

    app.error(function(err, req, res, next){
        console.log(err);
        res.send(err.message, 500);
    })

    app.listen(port);
    console.log("Ogre started, listening on port " + port);

    return true;
}
