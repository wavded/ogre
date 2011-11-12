var suite = require('vows'),
    assert = require('assert'),
    childp = require('child_process'),
    ogre = require('../src/ogre.js');

ogre.createServer(3001);

function curl(params){
    return function(){
        var callback = this.callback;
        childp.exec('curl -s ' + params.join(' ') + ' http://localhost:3001/convert',{maxBuffer: 1024 * 7500},function(e,data){
            try {
              if(data.charAt(0) == "{") data = JSON.parse(data);
            } catch(e){
              console.log('\n\nUnable to Parse JSON for: ' + params + ': ogr2ogr support may be lacking.');
            }
            callback(e,data);
        });
    }
}
function assertGeoJSON(e,data){
    assert.equal(data.type,"FeatureCollection");
}

suite.describe('Ogre').addBatch({
    'when no file is provided': {
        topic: curl(['-d','""']),

        'should indicate an error': function(e,data){
            assert.isTrue(data.error);
        },
        'should give an error message': function(e,data){
            assert.equal(data.message,"No file provided.  Ogre sad");
        }
    },
    'when a json callback is provided': {
        topic: curl(['-F','"upload=@test/samples/sample.csv"','-F','"callback=test123"']),

        'data should start with <callback>(': function(e,data){
            assert.match(data,/^test123\(/);
        },
        'data should end with );': function(e,data){
            assert.match(data,/\);$/);
        }
    },
    'when uploaded an invalid file': {
        topic: curl(['-F','"upload=@test/samples/sample.bad"']),

        'should indicate an error': function(e,data){
            assert.isTrue(data.error);
        },
        'should give an error message': function(e,data){
            assert.equal(data.message,"Ogre can't transform files of type: bad");
        }
    },
    'when uploading a BNA file (.bna)': {
        topic: curl(['-F','"upload=@test/samples/sample.bna"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a CSV file (.csv) with xy geometry': {
        topic: curl(['-F','"upload=@test/samples/sample.csv"']),

        'should return GeoJSON': assertGeoJSON,
        'should have geometry': function(e,data){
            assert.isNotNull(data.features[0].geometry);
        }
    },
    'when uploading a CSV file (.csv) with wkt geometry': {
        topic: curl(['-F','"upload=@test/samples/sample-geom.csv"']),

        'should return GeoJSON': assertGeoJSON,
        'should have geometry': function(e,data){
            assert.isNotNull(data.features[0].geometry);
        }
    },
    'when uploading a CSV file (.csv) with no geometry': {
        topic: curl(['-F','"upload=@test/samples/sample-nogeom.csv"']),

        'should return GeoJSON': assertGeoJSON,
        'should not have geometry': function(e,data){
            assert.isNull(data.features[0].geometry);
        }
    },
    'when uploading a DGN file (.dgn)': {
        topic: curl(['-F','"upload=@test/samples/sample.dgn"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a DXF file (.dxf)': {
        topic: curl(['-F','"upload=@test/samples/sample.dxf"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a ESRI ShapeFile (.shp)': {
        topic: curl(['-F','"upload=@test/samples/sample.shp"']),

        'should indicate an error': function(e,data){
            assert.isTrue(data.error);
        },
        'should give an error message': function(e,data){
            assert.equal(data.message,"Ogre can't transform files of type: shp");
        }
    },
    'when uploading a ESRI ShapeFile (.zip)': {
        topic: curl(['-F','"upload=@test/samples/sample.shp.zip"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a GeoConcept file (.gxt)': {
        topic: curl(['-F','"upload=@test/samples/sample.gxt"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a GeoJSON file (.json)': {
        topic: curl(['-F','"upload=@test/samples/sample.json"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a GeoRSS file (.rss)': {
        topic: curl(['-F','"upload=@test/samples/sample.rss"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a GML file (.gml)': {
        topic: curl(['-F','"upload=@test/samples/sample.gml"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a GML file (.zip)': {
        topic: curl(['-F','"upload=@test/samples/sample.gml.zip"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a GMT file (.gmt)': {
        topic: curl(['-F','"upload=@test/samples/sample.gmt"']),

        'should return GeoJSON': assertGeoJSON
    },
    // 'when uploading a GPX file (.gpx)': {
    //     topic: curl(['-F','"upload=@test/samples/sample.gpx"']),

    //     'should return GeoJSON': assertGeoJSON
    // },
    'when uploading a Iterlis 1 file (.itf)': {
        topic: curl(['-F','"upload=@test/samples/sample.itf"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a Iterlis 1 file (.zip)': {
        topic: curl(['-F','"upload=@test/samples/sample.itf.zip"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a KML file (.kml)': {
        topic: curl(['-F','"upload=@test/samples/sample.kml"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a KML file (.kmz)': {
        topic: curl(['-F','"upload=@test/samples/sample.kmz"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when uploading a MapInfo file (.zip)': {
        topic: curl(['-F','"upload=@test/samples/sample.map.zip"']),

        'should return GeoJSON': assertGeoJSON
    },
    // 'when uploading a S-57 file (.zip)': {
    //     topic: curl(['-F','"upload=@test/samples/sample.s57.zip"']),

    //     'should return GeoJSON': assertGeoJSON
    // },
    // 'when uploading a TIGER file (.rt1)': {
    //     topic: curl(['-F','"upload=@test/samples/sample.rti.zip"']),

    //     'should return GeoJSON': assertGeoJSON
    // },
    'when uploading a VRT file (.zip)': {
        topic: curl(['-F','"upload=@test/samples/sample.vrt.zip"']),

        'should return GeoJSON': assertGeoJSON
    },
    'when viewing a file': {
        topic: curl(['-F','"upload=@test/samples/sample.gml"','-F','"view="']),

        'should return HTML w/ OpenLayers': function(e,data){
            assert.includes(data,"OpenLayers");
        }
    }
}).export(module);
