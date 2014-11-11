#!/usr/bin/env node
var ogre = require('../')

var args = process.argv.slice(2)
var version = require('../package.json').version

var usage = ''
    + '\n\x1b[1mUsage\x1b[0m: ogre [options]\n'
    + '\n'
    + '\x1b[1mOptions:\x1b[0m\n'
    + ' -h, --help      help\n'
    + ' -p, --port      port number (default 3000)\n'
    + ' -v, --version   version number\n'
    + ' -f, --format    output format (default "GeoJSON")\n'
    + ' -t, --timeout   timeout in ms (default 15000)\n'
    + ' --skipfailures  toggle continue after failure, skipping failed feature (default false)\n'

var port = 3000
var format = 'GeoJSON'
var timeout = 15000
var skipfailures = false

var arg
while (args.length) {
  arg = args.shift()
  switch (arg) {
    case '-h':
    case '--help':
      console.log(usage)
      process.exit(0)
      break

    case '-v':
    case '--version':
      console.log('ogre ' + version)
      process.exit(0)
      break

    case '-p':
    case '--port':
      port = args.shift()
      break

    case '-f':
    case '--format':
      format = args.shift()
      break

    case '-t':
    case '--timeout':
      timeout = args.shift()
      break

    case '--skipfailures':
      skipfailures = true
      break

    default:
  }
}

var options = {
  format: format,
  timeout: timeout,
  skipfailures: skipfailures
}

ogre.createServer(options).listen(port)
console.log('Ogre listening on port', port)
