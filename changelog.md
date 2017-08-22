# 1.3.0 / 2016-07-25

- Upgrade dependencies
- Add option to create RFC7946-compliant file for Mapbox upload [dericke]

# 1.2.0 / 2016-07-25

- Add force download option
- Add 400 and 500 status codes [itjope]
- Add optional format option in convertJson [itjope]
- Expose Content-Disposition header [btfou]
- Add extra param to name shp files in zip [btfou]

# 1.1.0 / 2015-06-17

- add; ability to configure timeout

# 1.0.1 / 2015-01-05

- mod; urlencoded limit bump

# 1.0.0 / 2014-11-21

- add; skip failures as an option (not default) [breaking]

# 0.8.0 / 2014-11-04

- deps; update
- mod; switch to jenkins

# 0.7.1 / 2014-06-19

- mod; switch to utf8 responses
- add; docker support
- mod; readme to link to wiki

# 0.6.6 / 2014-01-25

- add; respond to OPTIONS requests with CORS headers to allow preflighted requests [bilts](https://github.com/bilts)

# 0.6.5 / 2014-01-12

- bump; deps (ogr2ogr)

# 0.6.4 / 2014-01-06

- update; deps

# 0.6.3 / 2013-11-20

- add; forcePlainText option

# 0.6.2 / 2013-11-15

- update; ogr2ogr dep

# 0.6.1 / 2013-11-12

- update; ogr2ogr dep

# 0.6.0 / 2013-11-11

- update; broke ogr2ogr wrapper into a separate project
- add; source/target srs reprojection

# 0.5.1 / 2013-09-06

- enable CORS on convert routes [rclark]
- added; npm badge

# 0.5.0 / 2013-07-10

- updated; jade compatability
- updated; adjust temp dir location to use os.tmpDir()
- removed; support for node 0.6
- added; allow a jsonUrl to be POSTed. Get the URL content and then continue

# 0.4.0 / 2013-04-09

- updated; express 3
- updated; app dependencies
- added; node 0.10 travis support

# 0.3.5 / 2013-03-22

- removed; stylus as a dependency

# 0.3.4 / 2012-07-09

- removed; support for 0.4.x
- added; testing for 0.8.x

# 0.3.3 / 2012-04-27

- updated; force express 2.x
- fixed; stdout changed, csv parsing of "

# 0.3.1 / 2012-03-02

- updated; dependencies
- updated; bootstrap

# 0.3.0 / 2012-01-13

- updated; version lockdown for deps
- added; Travis CI

# 0.2.5 / 2011-11-12

- node 0.6 support
- failing test cleanup

# 0.2.4 / 2011-09-17

- Invalid package in package.json

# 0.2.3 / 2011-09-17

- Updated UI look and feel

# 0.2.2 / 2011-09-08

- Added optional output name to geojson to shp
- Added note about convert to shapefile

# 0.2.1 / 2011-08-24

- Strict automatic csv parsing

# 0.2.0 / 2011-08-12

- Added more conversion formats to GeoJSON
- Added convert GeoJSON to Shapefile
- Revamped look and feel
