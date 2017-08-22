var ogre = require('../')
var test = require('tape')
var request = require('supertest')
var join = require('path').join
var server

test('create server', function(t) {
  var app = ogre.createServer()
  t.ok(app.request, 'is express')
  server = app.listen(9876)
  t.ok(server.close, 'is http server')
  t.end()
})

test('convert', function(t) {
  t.plan(7)

  request(server)
    .post('/convert')
    .attach('upload', join(__dirname, '/samples/sample.shp.zip'))
    .end(function(er, res) {
      if (er) throw er

      var data = res.body
      t.equals(data.type, 'FeatureCollection', 'is geojson')
    })

  request(server)
    .post('/convert')
    .field('sourceSrs', 'EPSG:4326')
    .field('targetSrs', 'EPSG:3857')
    .attach('upload', join(__dirname, '/samples/sample.shp.zip'))
    .expect('Content-Type', 'application/json; charset=utf-8')
    .end(function(er, res) {
      t.notOk(er, 'no error', {error: er})
      if (res.body.crs) // testable on gdal 0.10.x or greater
        t.ok(res.body.crs.properties.name.match(/3857/), 'is reprojected')
      else t.ok(true, 'unable to test reprojection')
    })

  request(server)
    .post('/convert')
    .field('forcePlainText', '')
    .attach('upload', join(__dirname, '/samples/sample.shp.zip'))
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .end(function(er) {
      t.notOk(er, 'no error', {error: er})
    })

  request(server)
    .options('/convert')
    .expect('Access-Control-Allow-Origin', '*')
    .expect('Access-Control-Allow-Methods', 'POST')
    .expect('Access-Control-Allow-Headers', 'X-Requested-With')
    .expect('Allow', 'POST')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect('POST')
    .end(function(er, res) {
      if (er) throw er
      t.ok(res, 'responded')
    })

  request(server)
    .post('/convert')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(400, {error: true, msg: 'No file provided'})
    .end(function(er, res) {
      if (er) throw er
      t.ok(res, 'bad request when no file uploaded')
    })

  request(server)
    .post('/convert')
    .attach('upload', join(__dirname, '/samples/sample.bad'))
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(400)
    .end(function(er, res) {
      if (er) throw er
      t.ok(res.body.errors.length > 0, 'bad request on failure')
    })
})

test('convertJson', function(t) {
  t.plan(5)
  request(server)
    .post('/convertJson')
    .type('form')
    .send({jsonUrl: 'https://gist.github.com/wavded/7376428/raw/6dd3ad3de8157956b40f1cf09633e78bbdb1af18/test-single.geojson'})
    .end(function(er, res) {
      if (er) throw er

      var buf = res.text
      t.equal(buf[0], 'P', 'is zip')
    })

  request(server)
    .options('/convertJson')
    .expect('Access-Control-Allow-Origin', '*')
    .expect('Access-Control-Allow-Methods', 'POST')
    .expect('Access-Control-Allow-Headers', 'X-Requested-With')
    .expect('Allow', 'POST')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect('POST')
    .end(function(er, res) {
      if (er) throw er
      t.ok(res, 'responded')
    })

  request(server)
    .post('/convertJson')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(400, {error: true, msg: 'No json provided'})
    .end(function(er, res) {
      if (er) throw er
      t.ok(res, 'bad request when no json sent')
    })

  request(server)
    .post('/convertJson')
    .type('form')
    .send({json: '{'})
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(400, {error: true, msg: 'Invalid json provided'})
    .end(function(er, res) {
      if (er) throw er
      t.ok(res, 'bad request on invalid json')
    })

  request(server)
    .post('/convertJson')
    .type('form')
    .send({json: '{ "invalid": "geojson" }'})
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect(400)
    .end(function(er, res) {
      if (er) throw er
      t.ok(res.body.errors.length > 0, 'bad request on failure')
    })
})

test('close server', function(t) {
  server.close(function() {
    t.end()
  })
})
