import {serve} from "@hono/node-server"
import {serveStatic} from "@hono/node-server/serve-static"
import {ErrorHandler, Handler, Hono, NotFoundHandler} from "hono"
import {bodyLimit} from "hono/body-limit"
import {cors} from "hono/cors"
import {BlankEnv, BlankSchema} from "hono/types"
import {randomBytes} from "node:crypto"
import {unlink, writeFile} from "node:fs/promises"
import {tmpdir} from "node:os"
import {Readable} from "node:stream"
import ogr2ogr from "ogr2ogr"

export interface OgreOpts {
  port?: number
  timeout?: number
  limit?: number
}

interface UploadOpts {
  [key: string]: string | File
  targetSrs: string
  upload: File
  sourceSrs: string
  rfc7946: string
  forcePlainText: string
  forceDownload: string
  callback: string
}

const TMP_DIR = tmpdir()

class Ogre {
  app: Hono<BlankEnv, BlankSchema, "">
  private timeout: number
  private port: number
  private limit: number

  constructor({
    port = 3000,
    timeout = 150000,
    limit = 50000000,
  }: OgreOpts = {}) {
    this.port = port
    this.timeout = timeout
    this.limit = limit

    let app = (this.app = new Hono())
    app.notFound(this.notFound())
    app.onError(this.serverError())

    app.options("/", this.heartbeat())
    app.use(cors(), bodyLimit({maxSize: this.limit}))
    app.post("/convert", this.convert())
    app.post("/convertJson", this.convertJson())

    app.use("*", serveStatic({root: "./public"}))
  }

  start(): void {
    let server = serve({
      fetch: this.app.fetch,
      port: this.port,
    })

    let handler = (): void => {
      server.close(() => process.exit())
      setTimeout(process.exit, 30 * 1000)
    }
    process.on("SIGINT", handler)
    process.on("SIGTERM", handler)
  }

  private notFound = (): NotFoundHandler => (c) => {
    return c.json({error: "Not found"}, 404)
  }

  private serverError = (): ErrorHandler => (er, c) => {
    console.error(er.stack)
    return c.json({error: true, message: er.message}, 500)
  }

  private heartbeat = (): Handler => () => new Response()

  private convert = (): Handler => async (c) => {
    let {
      upload,
      targetSrs,
      sourceSrs,
      rfc7946,
      forcePlainText,
      forceDownload,
      callback,
    }: UploadOpts = await c.req.parseBody()
    if (!upload) {
      return c.json({error: true, msg: "No file provided"}, 400)
    }

    let opts = {
      timeout: this.timeout,
      options: [] as string[],
      maxBuffer: this.limit * 10,
    }

    if (targetSrs) opts.options.push("-t_srs", targetSrs)
    if (sourceSrs) opts.options.push("-s_srs", sourceSrs)
    if (rfc7946 != null) opts.options.push("-lco", "RFC7946=YES")

    c.header(
      "Content-Type",
      forcePlainText != null
        ? "text/plain; charset=utf-8"
        : "application/json; charset=utf-8",
    )

    if (forceDownload != null) {
      c.header("content-disposition", "attachment;")
    }

    let path = TMP_DIR + "/" + randomBytes(16).toString("hex") + upload.name
    let body: string
    try {
      let buf = await upload.arrayBuffer()
      await writeFile(path, Buffer.from(buf))
      let {data} = await ogr2ogr(path, opts)
      if (callback) {
        body = callback + "(" + JSON.stringify(data) + ")"
      } else {
        body = JSON.stringify(data)
      }
    } finally {
      unlink(path).catch((er) => console.error("unlink error", er.message))
    }
    return c.body(body)
  }

  private convertJson = (): Handler => async (c) => {
    let {jsonUrl, json, outputName, format, forceUTF8}: Record<string, string> =
      await c.req.parseBody()
    if (!jsonUrl && !json) {
      return c.json({error: true, msg: "No json provided"}, 400)
    }

    let data
    if (json) {
      try {
        data = JSON.parse(json)
      } catch (_er) {
        return c.json({error: true, msg: "Invalid json provided"}, 400)
      }
    }

    let input = jsonUrl || data
    let output = outputName || "ogre"

    let opts = {
      format: (format || "ESRI Shapefile").toLowerCase(),
      timeout: this.timeout,
      options: [] as string[],
      maxBuffer: this.limit * 10,
    }

    if (outputName) opts.options.push("-nln", outputName)
    if (forceUTF8 != null) opts.options.push("-lco", "ENCODING=UTF-8")

    let out = await ogr2ogr(input, opts)
    c.header(
      "content-disposition",
      "attachment; filename=" + output + out.extname,
    )

    if (out.stream) {
      return c.body(Readable.toWeb(out.stream) as ReadableStream)
    } else if (out.text) {
      return c.text(out.text)
    } else {
      return c.json(out.data)
    }
  }
}

export default Ogre
