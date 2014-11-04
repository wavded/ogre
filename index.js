var express = require('express')
var multiparty = require('connect-multiparty')
var ogr2ogr = require('ogr2ogr')
var fs = require('fs')
var urlencoded = require('body-parser').urlencoded

function enableCors (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  next()
}

function optionsHandler(methods) {
  return function(req, res, next) {
    res.header('Allow', methods)
    res.send(methods)
  }
}

exports.createServer = function (opts) {
  if (!opts) opts = {}

  var app = express()
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')

  app.options('/convert', enableCors, optionsHandler('POST'))
  app.options('/convertJson', enableCors, optionsHandler('POST'))

  app.use(express.static(__dirname + '/public'))
  app.get('/', function (req, res) { res.render('home', { trackcode: opts.gaCode || '' }) })

  app.use(urlencoded({ extended: false }))
  app.use(multiparty())

  app.post('/convert', enableCors, function (req, res, next) {
    var ogr = ogr2ogr(req.files.upload.path)

    if (req.body.targetSrs)
      ogr.project(req.body.targetSrs, req.body.sourceSrs)

    var sf = ogr.skipfailures().stream()
    sf.on('error', next)
    res.on('end', function () { fs.unlink(req.files.upload.path) })

    if (!req.body.callback) {
      res.header('Content-Type', 'forcePlainText' in req.body ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8')
      return sf.pipe(res)
    }

    res.header('Content-Type', 'text/javascript')
    res.write(req.body.callback+'(')

    sf.on('data', function (data) {
        res.write(data)
      })
      .on('end', function () {
        res.end(')')
      })
  })

  app.post('/convertJson', enableCors, function (req, res, next) {
    if (!req.body.jsonUrl && !req.body.json) return next(new Error('No json provided'))

    var ogr
    if (req.body.jsonUrl) {
      ogr = ogr2ogr(req.body.jsonUrl)
    } else {
      ogr = ogr2ogr(JSON.parse(req.body.json))
    }

    var sf = ogr.skipfailures().format('shp').stream()
    sf.on('error', next)

    res.header('Content-Type', 'application/zip')
    res.header('Content-Disposition', 'filename='+ (req.body.outputName || 'ogre.zip'))
    sf.pipe(res)
  })

  app.use(function (er, req, res, next) {
    console.error(er.stack)
    res.header('Content-Type', 'application/json')
    res.json({ error: true, msg: er.message })
  })

  return app
}
