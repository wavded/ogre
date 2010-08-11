var ex = require('child_process').exec,
    fm = require('formidable'),
    fs = require('fs'),
    sys = require('sys'),

    handleRequest = function(req,callback){
        var form = new fm.IncomingForm()

        form.parse(req, function(err, fields, files) {
            var file = files.upload || {};
            file.callback = callback
            file.jsonCallbackFn = fields.callback
            file.outputType = fields.forcePlainText ? "text/plain" : "application/json"

            err || !file.filename ? handleFileError(err,file) : processFile(file)
        })
    },

    handleFileError = function(err,file) {
        file.error = "Ogre needs a file to work with"
        handleError(err,file)
    },

    processFile = function(file) {
        file.ext = file.filename.replace(/^.*\.([A-Za-z0-9_]+)$/,"$1")
        file.outputfile = file.path + ".json"
        file.ext == "zip" ? handleZip(file) : handleSingle(file)
    },

    handleSingle = function(file) {
        file.inputfile = file.path + "." + file.ext
        fs.rename(file.path,file.inputfile,function(){
            runOgre(file)
        })
    },

    handleZip = function(file) {
        file.zipDirectory = file.path + '_zip'
        ex('unzip ' + file.path + ' -d ' + file.zipDirectory,
            function(err,stdout){
                file.inputfile = stdout.match(/inflating: (.*.shp)/)[1]
                runOgre(file)
            }
        )
    },

    runOgre = function(file) {
        ex('ogr2ogr -f "GeoJSON" stdout ' + file.inputfile, {maxBuffer: 1024 * 800},
            function(err,stdout,stderr){
                file.outputstream = stdout
                err ? handleOgreError(err,file) : handleOgreSuccess(file)
            }
        )
    },

    handleOgreError = function(err,file) {
        file.error = "Ogre couldn't convert this file"
        handleError(err,file)
    },

    handleOgreSuccess = function(file) {
        sys.log(file.inputfile)
        file.jsonCallbackFn ? handleJsonCallback(file) : handleCallback(file)
    },

    handleError = function(err,file){
        sys.log(err)
        file.outputstream = JSON.stringify({
            filename: file.filename,
            error: "Ogre couldn't convert this file",
            message: err.message
        })
        file.jsonCallbackFn ? handleJsonCallback(file) : handleCallback(file)
    },

    handleCallback = function(file) {
        file.callback(file.outputstream,file.outputType)
        file.zipDirectory ? cleanupZip(file) : cleanupSingle(file)
    },

    handleJsonCallback = function(file) {
        file.outputstream = file.jsonCallbackFn + "(" + file.outputstream + ")"
        file.callback(file.outputstream,file.outputType)
        file.zipDirectory ? cleanupZip(file) : cleanupSingle(file)
    },

    cleanupSingle = function(file){
        fs.unlink(file.inputfile)
    },

    cleanupZip = function(file){
        fs.readdir(file.zipDirectory,function(err,files){
            var len = files.length,
                completed = 0
            while(len--)
                fs.unlink(file.zipDirectory + "/" + files[len],function(){
                    completed++
                    if(completed == files.length) fs.rmdir(file.zipDirectory)
                })
        })
        fs.unlink(file.path)
    }

exports.upload = handleRequest

