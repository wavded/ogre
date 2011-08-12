var suite = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    childp = require('child_process'),
    ogre = require('../src/ogre.js');

ogre.createServer(3002);

var sampleJSON = fs.readFileSync('test/samples/sample.json').toString().replace(/\n/g, '').replace(/"/g,'\\"');

function curl(params){
    return function(){
        var callback = this.callback;
        childp.exec('curl -s ' + params.join(' ') + ' http://localhost:3002/convertJson',{maxBuffer: 1024 * 17500},function(e,data){
            if(data.charAt(0) == "{") data = JSON.parse(data);
            callback(e,data);
        });
    }
}

suite.describe('Ogre').addBatch({
    'when no json data is provided': {
        topic: curl(['-d','""']),

        'should throw err': function(e,data){
            assert.equal(data.message,'No JSON provided.  Ogre sad');
        }
    },
    'when json data is provided': {
        topic: curl(['-d','"json=' + sampleJSON + '"']),

        'should have data': function(e,data){
            assert.isString(data);
        }
    }
}).export(module);

