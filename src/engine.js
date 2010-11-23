var Step = require('step'),
    fm = require('formidable'),
    fs = require('fs'),
    ex = require('child_process').exec,
    csv = require('./csv');
    
var bufferKB = 150000;

var OgreEngine = {
    processRequest: function(req){
        new fm.IncomingForm().parse(req,this);
    },
    createDataObject: function(err, fields, files){
        if(err) throw err;
        
        this.data = {
            file: files && files.upload,
            vrtFile: files && files.vrt,
            jsonCallback: fields.callback,
            launchViewer: "view" in fields,
            outputType: "forcePlainText" in fields ? "text/plain" : "application/json"
        };
        
        this(); //continue
    },
    checkFormErrors: function(err){
        if(err) throw err;      
        var d = this.data;
        
        if(!d.file)
            throw "No file provided.  Ogre sad";
        if(d.vrtFile && !/.vrt/.test(d.vrtFile.filename) )
            throw "VRT file must have the extension .vrt";
        
        this(); //continue
    },
    determineFileExtension: function(err){
        if(err) throw err;
        var d = this.data;
        
        d.fileExt = d.file.filename.replace(/^.*\.([A-Za-z0-9_]+)$/,"$1");
        d.outputFile = d.file.path + ".json";
        
        this(); //continue
    },
    determineOgreInputFile: function(err){
        if(err) throw err;
        var d = this.data;
        
        if(!/(zip|kmz)/.test(d.fileExt)){
            d.inputFile = d.file.path + "." + d.fileExt;
            fs.rename(d.file.path,d.inputFile,this);
        }
        else { //zip found
            d.zipDirectory = d.file.path + '_zip';
            var cont = this;
            
            ex('unzip ' + d.file.path + ' -d ' + d.zipDirectory,
                function(err,stdout){
                    if(err) throw err;
                    
                    var match;
                    
                    try {
                        match = stdout.match(/inflating: (.*.shp)/);
                        match || (match = stdout.match(/inflating: (.*.tab)/));
                        match || (match = stdout.match(/inflating: (.*.kml)/));
                        match || (match = stdout.match(/inflating: (.*.itf)/));
                        match || (match = stdout.match(/inflating: (.*.000)/));
                        match || (match = stdout.match(/inflating: (.*.gml)/));
                        match || (match = stdout.match(/inflating: (.*.vrt)/));

                        d.inputFile = match[1];
                    } catch (e) {}
                    
                    cont(); //continue
                }
            )
        }
    },
    handleVRTCandidates: function(err){
        if(err) throw err;
        var d = this.data, cont = this;
        
        if(d.fileExt == "csv"){
            csv.generateVrt(d.inputFile,function(data){
                if(data.vrtFile){
                    d.altInputFile = d.inputFile;
                    d.inputFile = data.vrtFile;
                    cont(); //continue;
                } else {
                    cont(); //continue; not a vrt canditate
                }
            });
        } else {
            this(); //continue
        }
    },
    runOgre: function(err){
        if(err) throw err;
        var d = this.data, cont = this;
        
        ex('ogr2ogr -f "GeoJSON" -skipfailures stdout ' + d.inputFile, {maxBuffer: 1024 * bufferKB},
            function(err,stdout,stderr){
                if(err){
                  cont('Ogre can\'t transform files of type: ' + d.fileExt);
                } else {
                  d.outputStream = stdout;
                  cont(); //continue
                }
            }
        );
    },
    cleanUp: function(err){
        var d = this.data, cont = this;
        if(d.zipDirectory){
            fs.readdir(d.zipDirectory,function(err,files){
                var len = files.length,
                    completed = 0;
                while(len--)
                fs.unlink(d.zipDirectory + "/" + files[len],function(){
                    completed++;
                    if(completed == files.length) {
                        fs.rmdir(d.zipDirectory);
                        cont(); //continue
                    }
                })
            })
            fs.unlink(d.file.path);
        } else if(d.inputFile){
            fs.unlink(d.inputFile,this);
            
            if(d.altInputFile) fs.unlink(d.altInputFile);
            if(d.fileExt == "gml") fs.unlink(d.file.path + '.gfs'); //clean up gfs file created
        }

        if(err) throw err;
    }
}

var steps = [];
for (var step in OgreEngine) steps.push(OgreEngine[step]);
var OgreProcess = Step.fn.apply(null,steps);

module.exports = {
    setMaxBuffer: function(buffer){
        bufferKB = buffer;
    },
    upload: function(req,callback){
        OgreProcess(req,function(err){
            var output, data = this.data,
                outputType = (data && data.outputType) || "application/json",
                jsonCallback = data && data.jsonCallback;
            
            if(err) {
                output = JSON.stringify({
                    error: true,
                    message: err.message || err,
                    file: data && data.file && data.file.filename
                });
            } else {
                output = data.outputStream;
            }
            
            if(jsonCallback) output = jsonCallback + "(" + output + ");";
            
            callback(output,outputType);
        });
    }
};
