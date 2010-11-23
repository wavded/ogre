var vows = require('vows'),
    assert = require('assert'),
    csv = require('../src/ogre-csv');
    
vows.describe('Ogre CSV').addBatch({
    'when given a xy csv file': {
        topic: function(){
            var callback = this.callback;
            csv.generateVrt('test/samples/sample.csv',function(data){
                callback(null,data);
            });
        },
        
        'should return a match for x': function(e,data){
            assert.equal(data.matches.x,'x');
        },
        'should return a match for y': function(e,data){
            assert.equal(data.matches.y,'y');
        },
        
        'and finished with file': {
            topic: function(data){
                var callback = this.callback;
                csv.removeVrt(data,function(success){
                    callback(null,success);
                });
            },
            
            'should remove the temporary file': function(e,success){
                assert.isTrue(success);
            }
        }
    },
    'when given a geom csv file': {
        topic: function(){
            var callback = this.callback;
            csv.generateVrt('test/samples/sample-geom.csv',function(data){
                callback(null,data);
            });
        },
        
        'should return a match for geom': function(data){
            assert.equal(data.matches.geom,'the_geom');
        },
        
        'and finished with file': {
            topic: function(data){
                var callback = this.callback;
                csv.removeVrt(data,function(success){
                    callback(null,success);
                });
            },
            
            'should remove the temporary file': function(e,success){
                assert.isTrue(success);
            }
        }
    },
}).export(module);
