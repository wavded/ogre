#!/usr/bin/env node

var ogre = require('ogre');

var args = process.argv.slice(2);
    version = "0.0.4";

var usage = ''
    + '\n\x1b[1mUsage\x1b[0m: ogre [options]\n'
    + '\n'
    + '\x1b[1mOptions:\x1b[0m\n'
    + ' -h, --help      help\n'
    + ' -p, --port      port number (default 3000)\n'
    + ' -b, --buffer    maximum buffer size allowed in kilobytes (default 150000)\n'
    + ' -v, --version   version number\n';
    
var arg, buffer, port;
while (args.length) {
    arg = args.shift();
    switch (arg) {
        case '-h':
        case '--help':
            console.log(usage);
            process.exit(1);
            break;
        case '-v':
        case '--version':
            console.log("ogre " + version);
            process.exit(1);
            break;
        case '-p':
        case '--port':
            port = args.shift();
            break;
        case '-b':
        case '--buffer':
            buffer = args.shift();
            break;
        default:
    }
}

ogre.createServer(port,buffer);
