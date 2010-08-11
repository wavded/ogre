The instructions below are only if you are interested in running the project locally.  For help on how to use the web service, visit the [Ogre Homepage](http://ogre.adc4gis.com).

### Building

(1) Ogre requires that you already have installed [NodeJS](http://nodejs.org) and the the following packages:

- [Express](http://expressjs.com)
- [ejs](http://github.com/visionmedia/ejs)
- [node-formidable](http://github.com/felixge/node-formidable)
- [connect](http://github.com/senchalabs/connect)

You can easily install these modules using the [Node Package Manager (npm)](http://github.com/isaacs/npm).

(2) Ogre also requires the command line tool *ogr2ogr* which available as a part of the [gdal package](http://trac.osgeo.org/gdal/wiki/DownloadingGdalBinaries).

### Running

To run the app (in the ogre directory):

> $ node app.js

And visit the following url in a browser:

> http://localhost:3000

### License 

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