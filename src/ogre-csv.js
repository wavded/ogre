var Step = require('step'),
    fs = require('fs'),
    ex = require('child_process').exec,
    
    baseVRT =   '\
                <OGRVRTDataSource>\n\
                    <OGRVRTLayer name="ogre">\n\
                        <SrcDataSource relativeToVRT="1">%FILE%</SrcDataSource>\n\
                        <GeometryField encoding="%ENC%" %ENCOPT% />\n\
                    </OGRVRTLayer>\n\
                </OGRVRTDataSource>\
                ';

var OgreCSV = {
    getFirstLine: function(file){
        this.data = { file: file };
        ex("head -1 " + file,this);
    },
    parseHeaders: function(err, stdout){
        if(err) throw err;
        var d = this.data;
        
        d.headers = stdout.replace(/\n|\r/g,"").split(",")
        this(); //continue
    },
    locateGeometryColumns: function(err){
        if(err) throw err;
        var d = this.data, matches = {};
        
        d.headers.forEach(function(header){
            var ht = header.trim();
            
            switch(true){
                case /lon|longitude|lng|x/i.test(ht):
                    matches.x = header;
                    break;
                case /lat|latitude|y/i.test(ht):
                    matches.y = header;
                    break;
                case /the_geom/i.test(ht):
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
        var d = this.data,
            vrtText = baseVRT.replace('%FILE%',d.file);
        
        if(d.matches.geom)
            vrtText = vrtText.replace('%ENC%','WKT').replace('%ENCOPT%','field="'+d.matches.geom+'"');
        else if(d.matches.x && d.matches.y)
            vrtText = vrtText.replace('%ENC%','PointFromColumns').replace('%ENCOPT%','x="'+d.matches.x+'" y="'+d.matches.y+'"');
        else
            throw "No Matching Columns Found";
            
        d.vrtText = vrtText;
            
        this(); //continue
    },
    writeVRTFile: function(err){
        if(err) throw err;
        var d = this.data;
        d.vrtFile = '/tmp/ogre_vrt_'+(+new Date)+'.vrt';
        fs.writeFile(d.vrtFile, d.vrtText, this);
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
            callback(err ? false : true);
        });
    }
};
