The instructions below are only if you are interested in running the project locally.  For help on how to use the web service, visit the [Ogre Homepage](http://ogre.adc4gis.com).

## Requirements

Ogre requires the command line tool *ogr2ogr* to be installed:

Ubuntu 9.04+
    $ sudo add-apt-repository ppa:ubuntugis/ubuntugis-unstable && sudo apt-get update && sudo apt-get install gdal-bin

Other Operating Systems - [gdal install page](http://trac.osgeo.org/gdal/wiki/DownloadingGdalBinaries).

## Installation

[npm](http://github.com/isaacs/npm):

    $ npm install ogre

## Running

To run the app:

    $ ogre

And visit the following url in a browser:

    http://localhost:3000

Type `ogre --help` to get a list of additional flags (like buffer size, Google Analytics settings)

## License

(The MIT License)

Copyright (c) 2010 Marc Harter &lt;wavded@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

