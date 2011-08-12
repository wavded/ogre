var Step = require('step'),
    fs = require('fs'),
    ex = require('child_process').exec,
    jsonId = 'ogre_json_' + (+new Date()) + '_',
    jsonInc = 0;

var OgreConvertFromJSON = {
    createDataObject: function(req){
        this.data = {
            json: req.body.json,
            fileId: jsonId + (jsonInc++)
        };

        this(); //continue
    },
    checkFormErrors: function(err){
        if(err) throw err;
        var d = this.data;

        if(!d.json)
            throw "No JSON provided.  Ogre sad";

        this(); //continue
    },
    writeJsonFile: function(err){
        if(err) throw err;
        var d = this.data;

        d.fileExt = 'json';
        d.inputFile = '/tmp/' + d.fileId + '.json';
        d.outputFolder = '/tmp/' + d.fileId;

        fs.writeFile(d.inputFile, d.json, this);
    },
    runOgre: function(err){
        if(err) throw err;
        var d = this.data, cont = this;

        ex('ogr2ogr -skipfailures -f "ESRI Shapefile" ' + d.outputFolder + ' ' + d.inputFile,
            function(err,stdout,stderr){
                if(err){
                  cont('Ogre can\'t transform files of type: ' + d.format);
                } else {
                  cont(); //continue
                }
            }
        );
    },
    zipResult: function(err){
        if(err) throw err;
        var d = this.data, cont = this;

        d.outputZipFile = d.outputFolder + '.zip';

        ex('cd ' + d.outputFolder + ' && zip ' + d.outputZipFile + ' *',
            function(err,stdout){
                cont(err);
            }
        )
    },
    cleanUp: function(err){
        var d = this.data;
        if(d.inputFile){
            var d = this.data, cont = this;
            fs.unlink(d.inputFile, function(err,files){
                fs.readdir(d.outputFolder,function(err,files){
                    var len = files.length,
                        completed = 0;
                    while(len--)
                    fs.unlink(d.outputFolder + "/" + files[len],function(){
                        completed++;
                        if(completed == files.length) {
                            cont();
                            fs.rmdir(d.outputFolder);
                        }
                    })
                })
            });
        }
        if(err) throw err;
    }
}

var steps = [];
for (var step in OgreConvertFromJSON) steps.push(OgreConvertFromJSON[step]);
var OgreProcess = Step.fn.apply(null,steps);

module.exports = {
    removeOutputFile: function(outputZipFile){
        fs.unlink(outputZipFile);
    },
    upload: function(req,callback){
        OgreProcess(req,function(err){
            var data = this.data || {};

            if(err) {
                err = JSON.stringify({
                    error: true,
                    message: err.message || err,
                    json: data.json
                });
            }

            callback(err, data.outputZipFile);
        });
    }
};
