const moment = require('moment')
const smol = require('smol')

module.exports = class ApiResponse {

  // constructor
  constructor(req, res) {
    this.req = req
    this.res = res
    res.apiResponse = this
    this.response = {}
  }

  // add a new/updated resource to the response
  async addResource(resource, options) {

    // create resource object
    if (!this.response.resource) this.response.resource = {}

    // if array of resources, add each individually
    if (Array.isArray(resource)) {
      for (let res of resource) await this.addResource(res, options)
      return this
    }

    // call resource's built-in add resource function, or default function
    let packagedResource, type, key
    if (resource.addResource) {
      let info = await resource.addResource(this, options);
      [packagedResource, type, key] = [info.resource, info.type, info.key]
    }

    // use default resource packaging, type, and key
    if (!packagedResource) {
      packagedResource = {}
      for (let attr in resource.attributes) packagedResource[attr] = resource.attributes[attr]
    }
    if (!type) type = smol.string.camelCase(resource.constructor.name)
    if (!key) key = 'id'

    // map dates
    for (let attr in packagedResource) {
      if (packagedResource[attr] && packagedResource[attr].constructor && ['Date', 'Moment'].includes(packagedResource[attr].constructor.name)) packagedResource[attr] = moment(packagedResource[attr]).format('YYYY-MM-DD HH:mm:ss')
    }

    // create resource list for resource type
    if (!this.response.resource[type]) this.response.resource[type] = []

    // ensure item is unique
    this.response.resource[type].filter(res => res[key] == packagedResource[key]).forEach(res => smol.array.remove(this.response.resource[type], res))

    // add resource to list
    this.response.resource[type].push(packagedResource)

    // return apiResponse
    return this

  }

  // add token for user to response
  addToken(user, password) {
    this.response.token = user.createToken(password)
    return this
  }

  // add a deleted resource to the response
  deleteResource(type, id) {
    if (Array.isArray(id)) {
      id.forEach(resourceId => this.deleteResource(type, resourceId))
      return this
    }
    if (!this.response.deletedResource) this.response.deletedResource = {}
    if (!this.response.deletedResource[type]) this.response.deletedResource[type] = []
    if (!this.response.deletedResource[type].includes(id)) this.response.deletedResource[type].push(id)
    return this
  }

  // api response express middleware
  static async middleware(req, res, next) {
    new ApiResponse(req, res)
    next()
  }

  // send packaged apiResponse
  send() {
    this.res.send(this.response)
    return this
  }

}
