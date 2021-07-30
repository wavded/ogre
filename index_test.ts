import test from 'blue-tape'
import request from 'supertest'
import Ogre, {OgreOpts} from './'

test(async (t) => {
  let table: {
    opts?: OgreOpts
    method?: string
    url: string
    status: number
    body?: string
    upload?: string
    contents?: RegExp
  }[] = [
    {method: 'OPTIONS', url: '/', status: 200},
    {url: '/not-found', status: 404},
    {url: '/', status: 200},

    {method: 'POST', url: '/convert', status: 400, contents: /no file/i},
    {
      method: 'POST',
      url: '/convert',
      status: 200,
      upload: './testdata/sample.shp.zip',
    },
    {
      opts: {limit: 5},
      method: 'POST',
      url: '/convert',
      status: 500,
      upload: './testdata/sample.shp.zip',
    },

    {method: 'POST', url: '/convertJson', status: 400, contents: /no json/i},
    {
      method: 'POST',
      url: '/convertJson',
      status: 200,
      body: `json=${JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {type: 'Point', coordinates: [102.0, 0.5]},
            properties: {prop0: 'value0'},
          },
        ],
      })}`,
    },
    {
      opts: {limit: 5},
      method: 'POST',
      url: '/convertJson',
      status: 500,
      body: `json=${JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {type: 'Point', coordinates: [102.0, 0.5]},
            properties: {prop0: 'value0'},
          },
        ],
      })}`,
    },
  ]

  for (let tt of table) {
    let ogre = new Ogre(tt.opts)
    let req

    switch (tt.method) {
      case 'OPTIONS':
        req = request(ogre.app).options(tt.url)
        break
      case 'POST':
        req = request(ogre.app).post(tt.url).send(tt.body)
        break
      default:
        // 'GET'
        req = request(ogre.app).get(tt.url)
        break
    }

    if (tt.upload) {
      req = req.attach('upload', tt.upload)
    }

    let res = await req

    t.equal(res.status, tt.status, tt.url)
    if (tt.contents) {
      t.match(res.text, tt.contents)
    }
  }
})
