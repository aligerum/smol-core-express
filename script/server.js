const formidable = require('express-formidable')
const smol = require('smol')
const coreConfig = smol.config(smol.coreName)
const smolConfig = smol.config()
const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const router = require('./router')
const fs = require('fs')
const ApiResponse = require('../class/ApiResponse')
const validator = require('./validator')

// allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.get('origin'))
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, X-Auth-Token')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
  res.header('Access-Control-Allow-Credentials', true)
  next()
})

// remove powered by express header
app.disable('x-powered-by')

// allow various post data
app.use(formidable())

// add global middleware
app.use(ApiResponse.middleware)
app.use(validator.middleware)

// add routes
let routes
router.app = app
if (fs.existsSync(`core/${smol.coreName}/data/routes.js`)) routes = require(`${process.cwd()}/core/${smol.coreName}/data/routes`)
if (routes && routes.http) routes.http(router)

// handle errors
app.use((err, req, res, next) => {
  if (smolConfig.mode == 'development') return res.status(500).send(`<pre>${err.stack}</pre>`)
  res.status(500).send('Internal Server Error')
})

// listen on configured port
http.listen(coreConfig.port, () => console.log(smol.colors.green(`${smolConfig.appName} Express API core (${smol.coreName}) listening on port ${coreConfig.port}${coreConfig.maintenanceMode ? ' in maintenance mode' : ''}`)))

// set up sockets
if (!smolConfig.maintenanceMode) {
  io.on('connection', socket => {
    console.log('connected')
    socket.on('disconnect', () => console.log('disconnect'))
    routes.ws(socket)
  })
}
