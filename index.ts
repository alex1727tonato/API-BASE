import Debug from 'debug'
import morgan from 'morgan'
import restify from 'restify'
import routes from './routes'
import config from './config'
import mongoose from 'mongoose'
import errs from 'restify-errors'
import CookieParser from 'restify-cookies'
import corsMiddleware from 'restify-cors-middleware2'

const debug = Debug('api:index')

declare module 'restify' {
  interface Request {
    payload?: any
  }
}

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*'],
  allowHeaders: ['Authorization'],
  exposeHeaders: ['Authorization'],
})

const server = restify.createServer({
  name: config.name,
  version: config.version,
})

server.server.setTimeout(60000 * 5)
if (_DEV_ === true) {
  server.use(morgan('dev'))
}

server.use(restify.plugins.queryParser()) // Pone el header en contenttype: APLICATION.JSON de las peticiones del APP
server.use(restify.plugins.bodyParser({ mapParams: false })) // Conversion de los tipos de datos de los JSON a su tipo.
server.pre(cors.preflight) // Acepte peticiones de cualquier lado
server.use(cors.actual) // Actualiza las peticiones del core
server.use(CookieParser.parse) // Para detectar que en las cabeceras viene una cookie

// INSTANCIA LA CONECION A LA BASE DE DATOS
let counter = 0
const ATTEMPTS = 20
debug('conectando a la base de datos:\n%s', config.databaseURI)
mongoose.connect(config.databaseURI)
mongoose.connection.on('error', (err) => {
  debug('error conectando a la base de datos')
  if (err.code === 'ECONNREFUSED' && counter !== ATTEMPTS) {
    console.log(`intentando conectar a mongodb [${++counter}/${ATTEMPTS}]...`)
    setTimeout(() => {
      mongoose.connect(config.databaseURI)
    }, 5000)
  } else {
    console.error(err)
    process.exit(1)
  }
})

// REALIZA LA CONECCION A LA BASE DE DATOS
mongoose.connection.once('open', () => {
  debug('se conectó a la base de datos')
  routes.applyRoutes(server)
  server.listen(config.port, () => {
    console.log(`Server is listening on port:: ${config.port}`)
  })
})

// Generacion de las rutas, y manejo de los errores (da formato a los errores)
server.on('restifyError', (req, res, err, callback) => {
  console.log('se ha capturado un error: ')
  if (Object.keys((errs as any).info(err)).length !== 0) {
    err.toJSON = function () {
      return {
        code: err.name,
        message: err.message,
        ...(errs as any).info(err),
      }
    }
  }
  let errorMessage: any
  switch (err.name) {
    case 'ValidationError':
      errorMessage = err.toString()
      break
    default:
      errorMessage = err
  }
  console.error(
    '* Fecha:',
    new Date().toLocaleString(),
    '\nProyecto:',
    req.payload?.proyecto,
    '\nEndpoint:',
    req.method,
    req.href(),
    '\nError:',
    errorMessage,
    '\nInformación adicional:',
    (<any>errs).info(err),
    '\n------------------------------------',
  )
  return callback()
})

// ESTADO EN EL QUE ESTA EL SERVIDOR: 1 (CORRECTO), 2 (CON ERRORES O ESPERA), 15 (DETENIDO)
const signals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
}

const shutdown = (signal, value) => {
  console.log('shutdown!')
  server.close(() => {
    mongoose.connection.close(() => {
      console.log(`server stopped by ${signal} with value ${value}`)
      process.exit(128 + value)
    })
  })
}

Object.keys(signals).forEach((signal) => {
  process.on(<any>signal, () => {
    console.log(`process received a ${signal} signal`)
    shutdown(signal, signals[signal])
  })
})
