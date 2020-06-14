const smol = require('smol')
const coreConfig = smol.config(smol.coreName)
const smolConfig = smol.config()

module.exports = async function (req, res, next) {

  // check if is in maintenance mode
  if (coreConfig.maintenanceMode) res.status(503).send(`${smolConfig.appName} is down for maintenance`)
  else next()

}
