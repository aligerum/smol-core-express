const fs = require('fs')
const smol = require('smol')

let coreConfig = smol.config(smol.coreName)
let controllers = {}
let middlewares = {}

// load all controllers
let controllerNames = []
if (fs.existsSync(`core/${smol.coreName}/controller`)) controllerNames = fs.readdirSync(`core/${smol.coreName}/controller`).map(item => item.slice(0, -3))
for (let controllerName of controllerNames) controllers[controllerName] = require(`${process.cwd()}/core/${smol.coreName}/controller/${controllerName}`)
let hookControllerPaths = smol.hook('loadController').flat()
for (let controllerPath of hookControllerPaths) controllers[controllerPath.split('/').slice(-1)[0].split('.').slice(0, -1)[0]] = require(controllerPath)

// load all middleware
let middlewareNames = []
let builtInMiddlewareNames = fs.readdirSync(`${__dirname}/../middleware`).map(item => item.slice(0, -3))
for (let middlewareName of builtInMiddlewareNames) middlewares[middlewareName] = require(`${__dirname}/../middleware/${middlewareName}`)
if (fs.existsSync(`core/${smol.coreName}/middleware`)) middlewareNames = fs.readdirSync(`core/${smol.coreName}/middleware`).map(item => item.slice(0, -3))
for (let middlewareName of middlewareNames) middlewares[middlewareName] = require(`${process.cwd()}/core/${smol.coreName}/middleware/${middlewareName}`)
let hookMiddlewarePaths = smol.hook('loadMiddleware').concat(smol.hook('loadRequest')).flat()
for (let middlewarePath of hookMiddlewarePaths) middlewares[middlewarePath.split('/').slice(-1)[0].split('.').slice(0, -1)[0]] = require(middlewarePath)

// load all requests
let requestNames = []
if (fs.existsSync(`core/${smol.coreName}/request`)) requestNames = fs.readdirSync(`core/${smol.coreName}/request`).map(item => item.slice(0, -3))
for (let requestName of requestNames) middlewares[requestName] = require(`${process.cwd()}/core/${smol.coreName}/request/${requestName}`)

module.exports = {

  // express app
  app: null,

  // add a route to listen for
  add(method, route, handler) {

    // ignore if function doesn't exist
    if (!handler) return

    // get function and middleware from controller if defined by name
    let controller = controllers[handler.split('.')[0]]
    let methodName = handler.split('.')[1]
    let controllerMethod = controller[methodName]
    if (!controllerMethod) return
    let middleware = [middlewares.maintenanceMode]
    if (controller.middleware && controller.middleware[methodName]) {
      let middlewareList = controller.middleware[methodName]
      if (!Array.isArray(middlewareList)) middlewareList = [middlewareList]
      for (let middlewareName of middlewareList) {
        let tokens = middlewareName.split(' ')
        let middlewareData = {args: tokens.slice(1)}
        middleware.push(middlewares[tokens[0]].bind(middlewareData))
      }
    }

    // wrap controller method to catch errors
    let wrappedMethod = async (req, res, next) => {
      try { await controllerMethod(req, res) }
      catch (err) { next(err) }
    }

    // set handler and middleware
    if (middleware.length) this.app[method](route, middleware, wrappedMethod)
    else this.app[method](route, wrappedMethod)

  },

  // set up a delete route
  delete(route, handler) {
    this.add('delete', route, handler)
  },

  // set up a get route
  get(route, handler) {
    this.add('get', route, handler)
  },

  // set up a post route
  post(route, handler) {
    this.add('post', route, handler)
  },

  // set up a put route
  put(route, handler) {
    this.add('put', route, handler)
  },

  // set up resource routes
  resource(route, controllerName) {
    this.add('get', `${route}`, `${controllerName}.index`)
    this.add('delete', `${route}/:id`, `${controllerName}.destroy`)
    this.add('post', `${route}/:id/delete`, `${controllerName}.destroy`)
    this.add('post', `${route}/delete`, `${controllerName}.destroyMultiple`)
    this.add('get', `${route}/:id`, `${controllerName}.show`)
    this.add('post', `${route}`, `${controllerName}.store`)
    this.add('put', `${route}/:id`, `${controllerName}.update`)
    this.add('put', `${route}`, `${controllerName}.updateMultiple`)
  },

}
