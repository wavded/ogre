#!/usr/bin/env node
const ogre = require('../')

let args = process.argv.slice(2)
let version = require('../package.json').version

let usage =
  '' +
  '\n\x1b[1mUsage\x1b[0m: ogre [options]\n' +
  '\n' +
  '\x1b[1mOptions:\x1b[0m\n' +
  ' -h, --help      help\n' +
  ' -p, --port      port number (default 3000)\n' +
  ' -v, --version   version number\n' +
  ' -t, --timeout   timeout before ogre kills a job in ms (default 15000)\n'

let port = 3000
let timeout

let arg
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

    case '-t':
    case '--timeout':
      timeout = Number(args.shift())
      break

    default:
  }
}

ogre.createServer({timeout: timeout}).listen(port)
console.log('Ogre listening on port', port)
