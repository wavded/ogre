var
    ex = require('child_process').exec,
    fm = require('formidable'),
    fs = require('fs'),
    sys = require('sys'),

    handleRequest = function(req,callback){
        var
            form = new fm.IncomingForm(),
            file = null;

        form.parse(req, function(err, fields, files) {
            if(err) handleError(err,null,"Ogre encountered an issue parsing your form data");
            
            file = files.upload || {};
                       
            file.callback = callback;
            file.vrt = files.vrt || {};
            file.jsonCallbackFn = fields.callback;
            file.launchViewer = "view" in fields;
            file.outputType = "forcePlainText" in fields ? "text/plain" : "application/json";
            
            verifyForm(file);
        });
    },
    
    verifyForm = function(file){
        if(!file.filename){
            handleError(null,file,"Ogre needs a file to work with");
            return;
        }
        if(file.vrt.filename && /\.vrt/.test(file.vrt.filename) ){
            handleError(null,file,"VRT needs to be of type (.vrt)");
            return;
        }
        processFile(file);
    },

    processFile = function(file) {
        file.ext = file.filename.replace(/^.*\.([A-Za-z0-9_]+)$/,"$1");
        file.outputfile = file.path + ".json";
        file.ext.match(/(zip|kmz)/) ? handleZip(file) : handleSingle(file);
    },

    handleSingle = function(file) {
        file.inputfile = file.path + "." + file.ext;
        fs.rename(file.path,file.inputfile,function(){
            runOgre(file);
        });
    },

    handleZip = function(file) {
        file.zipDirectory = file.path + '_zip';
        ex('unzip ' + file.path + ' -d ' + file.zipDirectory,
            function(err,stdout){
                if(err) handleError(err,file,"Ogre needs a valid zip file, is it corrupted?");
                try {
                    var match = stdout.match(/inflating: (.*.shp)/);
                    match || (match = stdout.match(/inflating: (.*.tab)/));
                    match || (match = stdout.match(/inflating: (.*.kml)/));
                    match || (match = stdout.match(/inflating: (.*.itf)/));

                    file.inputfile = match[1]
                } catch (e) {}
                err ? handleZipError(err,file) : runOgre(file);
            }
        );
    },

    runOgre = function(file) {
        ex('ogr2ogr -f "GeoJSON" stdout ' + file.inputfile, {maxBuffer: 1024 * 7500},
            function(err,stdout,stderr){
                if(err) handleError(err,file,"Ogre couldn't convert this file");
                file.outputstream = stdout;
                handleOgreSuccess(file);
            }
        );
    },

    handleOgreSuccess = function(file) {
        sys.log(file.inputfile);
        file.jsonCallbackFn && !file.launchViewer ? handleJsonCallback(file) : handleCallback(file);
    },

    handleError = function(err,file,msg){
        sys.log(err || "");
        file || (file = {});
        file.outputstream = JSON.stringify({
            filename: file.filename,
            error: file.error,
            message: err && err.message
        });
        file.jsonCallbackFn ? handleJsonCallback(file) : handleCallback(file);
    },

    handleCallback = function(file) {
        file.callback(file.outputstream,file.outputType,file.launchViewer);
        file.zipDirectory ? cleanupZip(file) : cleanupSingle(file);
    },

    handleJsonCallback = function(file) {
        file.outputstream = file.jsonCallbackFn + "(" + file.outputstream + ")";
        file.callback(file.outputstream,file.outputType,file.launchViewer);
        file.zipDirectory ? cleanupZip(file) : cleanupSingle(file);
    },

    cleanupSingle = function(file){
        file.inputfile && fs.unlink(file.inputfile);
    },

    cleanupZip = function(file){
        fs.readdir(file.zipDirectory,function(err,files){
            var len = files.length,
                completed = 0;
            while(len--)
                fs.unlink(file.zipDirectory + "/" + files[len],function(){
                    completed++;
                    if(completed == files.length) fs.rmdir(file.zipDirectory);
                })
        })
        fs.unlink(file.path);
    }

exports.upload = handleRequest;

