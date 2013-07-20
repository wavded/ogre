var express = require('express'),
    http = require('http'), https = require('https'), url = require('url'),
    toJson = require('./convert-to-json'),
    fromJson = require('./convert-from-json');

var app = null;

function enableCors(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    
    if (req.method === "OPTIONS") {
        res.send(200);
    } else {
        next();
    }
}

exports.createServer = function(port,maxBuffer,gaCode){
    app = express();
    port || (port = 3000);

    if(maxBuffer) ogre_engine.setMaxBuffer(maxBuffer);

    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.static(__dirname + '/public'))
    app.use(express.bodyParser())

    app.get('/', function(req, res){
        res.render('home', { trackcode: gaCode || '' })
    })

    app.post('/convert', enableCors, function(req, res){
        toJson.upload(req,
            function(outputstream,contentType,launchViewer){
                if(launchViewer)
                    res.render('viewer', { output: outputstream, trackcode: gaCode || '' });
                else {
                    res.header("Content-Type",contentType);
                    res.send(outputstream);
                }
            }
        )
    })

    app.post('/convertJson', enableCors, 
     function(req, res, next) {
         if (req.body.jsonUrl) {
            var parsedUrl = url.parse(req.body.jsonUrl), 
                prot = parsedUrl.protocol === "http:" ? http : https;
            prot.get(req.body.jsonUrl, function (response) {
                var data = '';
                response.on('data', function (chunk) { data += chunk; });                            
                response.on('end', function () {
                    req.body.json = data;
                    next();                
                });  
            });             
         } else { next(); }
     },
     function(req, res){
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

    app.use(function(err, req, res, next){
        console.log(err.message, err.stack);
        res.send(err.message, 500);
    })

    app.listen(port);
    console.log("Ogre started, listening on port " + port);

    return true;
}
