var Step = require('step'),
    fm = require('formidable'),
    fs = require('fs'),
    ex = require('child_process').exec;

var Ogrify = {
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

                        d.inputFile = match[1];
                    } catch (e) {}
                    
                    cont(); //continue
                }
            )
        }
    },
    runOgre: function(err){
        if(err) throw err;
        var d = this.data, cont = this;
        
        ex('ogr2ogr -f "GeoJSON" -skipfailures stdout ' + d.inputFile, {maxBuffer: 1024 * 157500},
            function(err,stdout,stderr){
                if(err){
                  cont("Ogre can't transform files of type: " + d.fileExt);
                } else {
                  d.outputStream = stdout;
                  cont();
                }
            }
        );
    }
}

var steps = [];
for (var step in Ogrify) steps.push(Ogrify[step]);
var OgreProcess = Step.fn.apply(null,steps);

module.exports = {
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
