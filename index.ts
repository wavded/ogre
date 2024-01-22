import {urlencoded} from "body-parser"
import cors from "cors"
import {randomBytes} from "crypto"
import express, {
  Application,
  ErrorRequestHandler,
  RequestHandler,
  Router,
} from "express"
import PromiseRouter from "express-promise-router"
import {unlink} from "fs"
import multer, {diskStorage} from "multer"
import ogr2ogr from "ogr2ogr"
import {join} from "path"

export interface OgreOpts {
  port?: number
  timeout?: number
  limit?: number
}

class Ogre {
  app: Application
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

    this.app = express()
    this.app.use(express.static(join(__dirname, "/public")))
    this.app.use(this.router())
  }

  router(): Router {
    let router = PromiseRouter()
    let upload = multer({
      storage: diskStorage({
        filename(_req, file, cb) {
          randomBytes(16, (err, raw) =>
            cb(err, raw.toString("hex") + file.originalname),
          )
        },
      }),
      limits: {fileSize: this.limit},
    })
    let encoded = urlencoded({extended: false, limit: this.limit})

    router.options("/", this.heartbeat())
    router.use(cors())
    router.post("/convert", upload.single("upload"), this.convert())
    router.post("/convertJson", encoded, this.convertJson())
    router.use(this.notFound())
    router.use(this.serverError())

    return router
  }

  start(): void {
    let server = this.app.listen(this.port)

    let handler = (): void => {
      server.close(() => process.exit())
      setTimeout(process.exit, 30 * 1000)
    }
    process.on("SIGINT", handler)
    process.on("SIGTERM", handler)
  }

  private heartbeat = (): RequestHandler => (_req, res) => {
    res.sendStatus(200)
  }

  private notFound = (): RequestHandler => (_req, res) => {
    res.status(404).send({error: "Not found"})
  }

  private serverError = (): ErrorRequestHandler => (er, _req, res, _next) => {
    console.error(er.stack)
    res.status(500).send({error: true, message: er.message})
  }

  private convert = (): RequestHandler => async (req, res) => {
    if (!req.file) {
      res.status(400).json({error: true, msg: "No file provided"})
      return
    }

    let b = req.body
    let opts = {
      timeout: this.timeout,
      options: [] as string[],
      maxBuffer: this.limit * 10,
    }

    if (b.targetSrs) opts.options.push("-t_srs", b.targetSrs)
    if (b.sourceSrs) opts.options.push("-s_srs", b.sourceSrs)
    if ("rfc7946" in b) opts.options.push("-lco", "RFC7946=YES")

    res.header(
      "Content-Type",
      "forcePlainText" in b
        ? "text/plain; charset=utf-8"
        : "application/json; charset=utf-8",
    )
    if ("forceDownload" in b) res.attachment()

    try {
      let {data} = await ogr2ogr(req.file.path, opts)
      if (b.callback) res.write(b.callback + "(")
      res.write(JSON.stringify(data))
      if (b.callback) res.write(")")
      res.end()
    } finally {
      unlink(req.file.path, (er) => {
        if (er) console.error("unlink file error", er.message)
      })
    }
  }

  private convertJson = (): RequestHandler => async (req, res) => {
    let b = req.body
    if (!b.jsonUrl && !b.json) {
      res.status(400).json({error: true, msg: "No json provided"})
      return
    }

    let data
    if (b.json) {
      try {
        data = JSON.parse(b.json)
      } catch (er) {
        res.status(400).json({error: true, msg: "Invalid json provided"})
        return
      }
    }

    let input = b.jsonUrl || data
    let output = b.outputName || "ogre"

    let opts = {
      format: (b.format || "ESRI Shapefile").toLowerCase(),
      timeout: this.timeout,
      options: [] as string[],
      maxBuffer: this.limit * 10,
    }

    if (b.outputName) opts.options.push("-nln", b.outputName)
    if ("forceUTF8" in b) opts.options.push("-lco", "ENCODING=UTF-8")

    let out = await ogr2ogr(input, opts)
    res.attachment(output + out.extname)

    if (out.stream) {
      out.stream.pipe(res)
      return
    } else if (out.text) {
      res.send(out.text)
    } else {
      res.send(out.data)
    }
  }
}

export default Ogre
