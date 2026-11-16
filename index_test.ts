import {test} from "bun:test"
import assert from "node:assert/strict"
import {basename} from "node:path"

import {file} from "bun"

import {Ogre, type OgreOpts} from "./"

test("Ogre", async () => {
  let table: {
    opts?: OgreOpts
    method?: string
    url: string
    status: number
    body?: string
    upload?: string
    contents?: RegExp
  }[] = [
    {method: "OPTIONS", url: "/", status: 200},
    {url: "/not-found", status: 404},
    {url: "/", status: 200, contents: /<!doctype html>/i},

    {method: "POST", url: "/convert", status: 400, contents: /no file/i},
    {
      method: "POST",
      url: "/convert",
      status: 200,
      upload: "./testdata/sample.shp.zip",
    },
    {
      opts: {limit: 5},
      method: "POST",
      url: "/convert",
      status: 500,
      upload: "./testdata/sample.shp.zip",
    },

    {method: "POST", url: "/convertJson", status: 400, contents: /no json/i},
    {
      method: "POST",
      url: "/convertJson",
      status: 200,
      body: `json=${JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {type: "Point", coordinates: [102.0, 0.5]},
            properties: {prop0: "value0"},
          },
        ],
      })}`,
    },
    {
      opts: {limit: 5},
      method: "POST",
      url: "/convertJson",
      status: 500,
      body: `json=${JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {type: "Point", coordinates: [102.0, 0.5]},
            properties: {prop0: "value0"},
          },
        ],
      })}`,
    },
  ]

  for (let tt of table) {
    let ogre = new Ogre(tt.opts)
    let body: BodyInit | undefined = tt.body
      ? new URLSearchParams(tt.body)
      : undefined
    if (tt.upload) {
      let form = new FormData()
      form.append("upload", file(tt.upload), basename(tt.upload))
      body = form
    }

    let res = await ogre.app.request(tt.url, {
      method: tt.method || "GET",
      body,
    })

    let text = await res.text()
    assert.equal(res.status, tt.status, tt.url)
    if (tt.contents) {
      assert.match(text, tt.contents)
    }
  }
})
