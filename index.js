const express = require('express')
const multiparty = require('connect-multiparty')
const ogr2ogr = require('ogr2ogr')
const fs = require('fs')
const urlencoded = require('body-parser').urlencoded
const join = require('path').join
const tmpdir = require('os').tmpdir;

function enableCors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Expose-Headers', 'Content-Disposition')
  next()
}

function optionsHandler(methods) {
  return function (req, res) {
    res.header('Allow', methods)
    res.send(methods)
  }
}

function isOgreFailureError(er) {
  return er && er.message && er.message.indexOf('FAILURE:') !== -1
}

function safelyParseJson(json) {
  try {
    if (json) return JSON.parse(json)
  } catch (e) {
    return ''
  }
}

function noop() {}

exports.createServer = function (opts) {
  if (!opts) opts = {}

  let app = express()
  app.set('views', join(__dirname, '/views'))
  app.set('view engine', 'pug')

  app.options('/convert', enableCors, optionsHandler('POST'))
  app.options('/convertJson', enableCors, optionsHandler('POST'))

  app.use(express.static(join(__dirname, '/public')))
  app.get('/', function (req, res) {
    res.render('home')
  })

  app.use(urlencoded({extended: false, limit: 3000000})) // 3mb
  app.use(multiparty({maxFilesSize: 100000000})) // 100mb

  app.post('/convert', enableCors, function (req, res, next) {
    if (!req.files.upload || !req.files.upload.name) {
      res.status(400).json({error: true, msg: 'No file provided'})
      return
    }

    let ogr = ogr2ogr(req.files.upload.path)

    if (req.body.targetSrs) {
      ogr.project(req.body.targetSrs, req.body.sourceSrs)
    }

    if ('rfc7946' in req.body) {
      ogr.options(['-lco', 'RFC7946=YES'])
    }

    if ('skipFailures' in req.body) {
      ogr.skipfailures()
    }

    if (opts.timeout) {
      ogr.timeout(opts.timeout)
    }

    res.header(
      'Content-Type',
      'forcePlainText' in req.body
        ? 'text/plain; charset=utf-8'
        : 'application/json; charset=utf-8'
    )

    if ('forceDownload' in req.body) {
      res.attachment()
    }

    ogr.exec(function (er, data) {
      fs.unlink(req.files.upload.path, noop)

      if (isOgreFailureError(er)) {
        return res
          .status(400)
          .json({errors: er.message.replace('\n\n', '').split('\n')})
      }

      if (er) return next(er)

      if (req.body.callback) res.write(req.body.callback + '(')
      res.write(JSON.stringify(data))
      if (req.body.callback) res.write(')')
      res.end()
    })
  })

  app.post('/convertJson', enableCors, async function (req, res, next) {
    if (!req.body.jsonUrl && !req.body.json)
      return res.status(400).json({error: true, msg: 'No json provided'})

    let json = safelyParseJson(req.body.json)

    if (req.body.json && !json)
      return res.status(400).json({error: true, msg: 'Invalid json provided'})

    let ogr

    if (req.body.jsonUrl) {
      ogr = ogr2ogr(req.body.jsonUrl)
    } else {
      ogr = ogr2ogr(json)
    }

    if (req.body.outputName) {
      ogr.options(['-nln', req.body.outputName])
    }

    if ('skipFailures' in req.body) {
      ogr.skipfailures()
    }

    if (opts.timeout) {
      ogr.timeout(opts.timeout)
    }

    let format = req.body.format.toLowerCase() || 'shp'

    ogr.format(format)

    const sendResponse = (buf) => {

      res.header('Content-Type', 'application/zip')
      res.header(
        'Content-Disposition',
        'filename=' + (req.body.outputName || 'ogre.zip')
      )
      res.end(buf)

    }

    try {

      switch (format) {
        // These formats must use .destination
        case 'dxf':
        case 'dgn':
        case 'txt':
        case 'gxt':
        case 'gmt':

          // Random string to prevent multiple request being overwritten
          let randomId = Math.random().toString(36).substring(7);

          let tmpDestination = join(tmpdir(), `/ogre-${randomId}.${format}`)
          await ogr.destination(tmpDestination).promise()

          let bufD = await fs.promises.readFile(tmpDestination, 'utf8')
          let errUnlink = await fs.promises.unlink(tmpDestination)

          if (errUnlink) {
            throw errUnlink
          } else {
            sendResponse(bufD)
          }          
          break;

        default:
          let buf = await ogr.promise()
          sendResponse(buf)
          break;        
      }

    } catch (er) {
      if (isOgreFailureError(er))
        return res
          .status(400)
          .json({ errors: er.message.replace('\n\n', '').split('\n') })
      if (er) return next(er)
    }
  })

  /* eslint no-unused-vars: [0, { "args": "none" }] */
  app.use(function (er, req, res, next) {
    console.error(er.stack)
    res.header('Content-Type', 'application/json')
    res.status(500).json({error: true, msg: er.message})
  })

  return app
}
