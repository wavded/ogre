var Step = require('step'),
    fs = require('fs'),
    cp = require('child_process'),
    uid = +new Date,

    baseVRT =   '<OGRVRTDataSource>\n\
                    <OGRVRTLayer name="%NAME%">\n\
                        <SrcDataSource relativeToVRT="1">%FILE%</SrcDataSource>\n\
                        <GeometryField encoding="%ENC%" %ENCOPT% />\n\
                    </OGRVRTLayer>\n\
                </OGRVRTDataSource>';

var OgreCSV = {
    getFirstLine: function(file){
        this.data = {
            file: file,
            name: file.replace(".csv","").replace("/tmp/","")
        };
        cp.execFile('head', [ '-1', file ], this);
    },
    parseHeaders: function(err, stdout){
        if(err) throw err;
        var d = this.data;

        d.headers = stdout.replace(/\n|\r|"/g,"").split(",")
        this(); //continue
    },
    locateGeometryColumns: function(err){
        if(err) throw err;
        var d = this.data, matches = {};

        d.headers.forEach(function(header){
            var ht = header.trim()

            switch(true){
                case /\b(lon|longitude|lng|x)\b/i.test(ht):
                    matches.x = header;
                    break;
                case /\b(lat|latitude|y)\b/i.test(ht):
                    matches.y = header;
                    break;
                case /\bthe_geom\b/i.test(ht):
                    matches.geom = header;
                    break;
                default:
            }
        });

        d.matches = matches;
        this(); //continue
    },
    createVRTText: function(err){
        if(err) throw err;
        var d = this.data;
        d.vrtText = baseVRT.replace('%FILE%',d.file).replace('%NAME%',d.name);

        if(d.matches.geom)
            d.vrtText = d.vrtText.replace('%ENC%','WKT').replace('%ENCOPT%','field="'+d.matches.geom+'"');
        else if(d.matches.x && d.matches.y)
            d.vrtText = d.vrtText.replace('%ENC%','PointFromColumns').replace('%ENCOPT%','x="'+d.matches.x+'" y="'+d.matches.y+'"');
        else d.vrtText = null;

        this(); //continue
    },
    writeVRTFile: function(err){
        if(err) throw err;
        var d = this.data;

        if(d.vrtText){
            d.vrtFile = '/tmp/ogre_vrt_'+(uid++)+'.vrt';
            fs.writeFile(d.vrtFile, d.vrtText, this);
        } else {
            this();
        }
    }
}

var steps = [];
for (var step in OgreCSV) steps.push(OgreCSV[step]);
var OgreCSVProcess = Step.fn.apply(null,steps);

module.exports = {
    generateVrt: function(file,callback){
        OgreCSVProcess(file,function(err){
            var data = this.data;

            if(err) {
                callback(err);
            } else {
                output = data.outputStream;
            }

            callback(data);
        });
    },
    removeVrt: function(data,callback){
        fs.unlink(data.vrtFile,function(err){
            callback(err ? err : true);
        });
    }
};
