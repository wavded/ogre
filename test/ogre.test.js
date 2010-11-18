var childProcess = require('child_process'),
    ogreApp = null,
    testPort = 3001,
    testUrl = 'http://localhost:' + testPort + '/convert';

function curlToJson(options,callback){
  var cmd = "curl -s " + options + " " + testUrl;
  //console.log(cmd);
  childProcess.exec(cmd, {maxBuffer: 1024 * 7500}, function(err,stdout,stderr){
    var data = null;
    try {
      data = JSON.parse(stdout);
    } catch(e) {
      data = stdout;
    } finally {
      callback(data);
    }
  });
}

module.exports['ogre'] = {

  'should be able to be created':
    function(assert){
      ogreApp = childProcess.spawn('node',['app.js',testPort]);
      setTimeout(function(){
        assert.ok(!ogreApp.killed);
        assert.done();
      },500); //give space for process to start
    },
    
  'should give an error when no file uploaded':
    function(assert){
      curlToJson('-d ""',function(data){
        assert.ok(data.error);
        assert.equals(data.message,"No file provided.  Ogre sad");
        assert.done();
      });
    },

  'should give an error when invalid .vrt provided':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.csv" -F "vrt=@test/samples/sample.csv"',function(data){
        assert.ok(data.error);
        assert.equals(data.message,"VRT file must have the extension .vrt");
        assert.done();
      });
    },
    
  'should wrap a callback around the JSON when provided':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.csv" -F "callback=test123"',function(data){
        assert.ok(/^test123\(/.test(data));
        assert.ok(/\);$/.test(data));
        assert.done();
      });
    },
    
  'should give an error when uploading an invalid file':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.bad"',function(data){
        assert.ok(data.error);
        assert.equals(data.message,"Ogre can't transform files of type: bad");
        assert.done();
      });
    },
  
  'should unzip and convert ESRI ShapeFile to GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.shp.zip"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
    
  'should unzip and convert a MapInfo file to GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.map.zip"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
    
  'should unzip and convert a KMZ file to GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.kmz"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
    
  'should unzip and convert a Interlis 1 file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.itf.zip"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },

  'should unzip and convert a GML file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.gml.zip"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },

  'should convert a KML file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.kml"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },

  'should convert a CSV file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.csv"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },

  'should convert a GML file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.gml"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
    
  'should convert a DGN file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.dgn"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
    
  'should convert a GeoJSON file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.json"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },

  'should convert a GeoRSS file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.rss"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
    
  'should convert a GeoConcept file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.gxt"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
    
  'should convert a DXF file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.dxf"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },

/* http://trac.osgeo.org/gdal/ticket/3842
  'should conver a GPX file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.s57.zip"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
*/  

/* http://trac.osgeo.org/gdal/ticket/3843
  'should unzip and convert a S57 file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.s57.zip"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
*/

/* http://trac.osgeo.org/gdal/ticket/3842
  'should conver a GPSTrackMaker file and return GeoJSON':
    function(assert){
      curlToJson('-F "upload=@test/samples/sample.gtm"',function(data){
        assert.equals(data.type,"FeatureCollection");
        assert.done();
      });
    },
*/

  'should be able to be torn down':
    function(assert){
      ogreApp.kill();
      setTimeout(function(){
        assert.ok(ogreApp.killed);
        assert.done();
      },500);
    }
}

process.on("exit",function(){
  if(!ogreApp.killed) ogreApp.kill('SIGHUP');
});

