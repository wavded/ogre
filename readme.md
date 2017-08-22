# ogre [![Build Status](https://jenkins.adc4gis.com/buildStatus/icon?job=ogre)](https://jenkins.adc4gis.com/job/ogre/)

The instructions below are only if you are interested in running the project locally. For help on how to use the web service, visit the [Ogre homepage](http://ogre.adc4gis.com). Ogre makes use of the [ogr2ogr](https://github.com/wavded/ogr2ogr) module.

## Requirements

ogr2ogr requires the command line tool _ogr2ogr_ - [gdal install page](http://trac.osgeo.org/gdal/wiki/DownloadingGdalBinaries). It is recommended to use the latest version.

## Installation

```
npm install -g ogre
```

[![NPM](https://nodei.co/npm/ogre.png?downloads=true)](https://nodei.co/npm/ogre)

For specific OS installation help, see the [wiki](https://github.com/wavded/ogre/wiki).

## Running

To run the app:

```
ogre -p 3000
```

And visit the following url in a browser:

```
http://localhost:3000
```

Options include:

```
Usage: ogre [options]

Options:
 -h, --help      help
 -p, --port      port number (default 3000)
 -v, --version   version number
 -t, --timeout   timeout before ogre kills a job in ms (default 15000)
```

## License

(The MIT License)

Copyright (c) 2016 Marc Harter <wavded@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
