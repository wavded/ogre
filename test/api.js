var ogre = require('../')
var test = require('tap').test
var request = require('supertest')
var server

test('create server', function (t) {
  var app = ogre.createServer()
  t.ok(app.request, 'is express')
  server = app.listen(9876)
  t.ok(server.close, 'is http server')
  t.end()
})

test('convert', function (t) {
  t.plan(2)

  request(server)
    .post('/convert')
    .attach('upload', __dirname+'/samples/sample.shp.zip')
    .end(function (er, res) {
      if (er) throw er

      var data = res.body
      t.equals(data.type, 'FeatureCollection', 'is geojson')
    })

  request(server)
    .post('/convert')
    .field('sourceSrs', 'EPSG:4326')
    .field('targetSrs', 'EPSG:3857')
    .attach('upload', __dirname+'/samples/sample.shp.zip')
    .end(function (er, res) {
      if (er) throw er

      var data = res.body
      t.ok(data.crs.properties.name.match(/3857/), 'is reprojected')
    })
})

test('convertJson', function (t) {
  request(server)
    .post('/convertJson')
    .type('form')
    .send({ jsonUrl: 'https://gist.github.com/wavded/7376428/raw/6dd3ad3de8157956b40f1cf09633e78bbdb1af18/test-single.geojson' })
    .end(function (er, res) {
      if (er) throw er

      var buf = res.text
      t.equal(buf[0], 'P', 'is zip')
      t.end()
    })
})

test('close server', function (t) {
  server.close(function () {
    t.end()
  })
})
