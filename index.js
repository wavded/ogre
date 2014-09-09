"use strict"
var express = require('express')
var multiparty = require('connect-multiparty')
var ogr2ogr = require('ogr2ogr')
var fs = require('fs')

function enableCors (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Methods', 'POST')
  res.header("Access-Control-Allow-Headers", "X-Requested-With")
  next()
}

function optionsHandler(methods) {
  return function(req, res, next) {
    res.header('Allow', methods)
    res.send(methods)
  }
}

exports.createServer = function (opts) {
  opts || (opts = {})

  var app = express()
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')

  app.use(express.static(__dirname + '/public'))
  app.use(express.urlencoded())
  app.use(multiparty())
  app.use(app.router)
  app.use(function (er, req, res, next) {
    console.error(er.stack)
    res.header('Content-Type', 'application/json')
    res.json({ error: true, msg: er.message })
  })

  app.get('/', function (req, res) { res.render('home', { trackcode: opts.gaCode || '' }) })

  app.options('/convert', enableCors, optionsHandler('POST'))
  app.post('/convert', enableCors, function (req, res, next) {
    var ogr = ogr2ogr(req.files.upload.path)

    if (req.body.targetSrs)
      ogr.project(req.body.targetSrs, req.body.sourceSrs)

    var sf = ogr.skipfailures().stream()
    sf.on('error', next)
    res.on('end', function () { fs.unlink(req.files.upload.path) })

    if (!req.body.callback) {
	  if (req.body.responseType && req.body.responseType == "download"){
	    res.header('Content-Type', 'forcePlainText' in req.body ? 'text/plain; charset=utf-8' : 'application/octet-stream; charset=utf-8')
	    res.header('Content-Disposition', 'attachment; filename='+req.files.upload.originalFilename+'.geojson')
	  }else{
	    // standard JSON response
	    res.header('Content-Type', 'forcePlainText' in req.body ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8')
	  }
      return sf.pipe(res)
    }

    res.header('Content-Type', 'text/javascript')
    res.write(req.body.callback+'(')
    sf.on('data', function (data) { res.write(data) })
    sf.on('end', function () {
      res.end(')');
    })
  })

  app.options('/convertJson', enableCors, optionsHandler('POST'))
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

  return app
}
