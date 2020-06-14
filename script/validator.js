let middleware = async (req, res, next) => {
  req.validate = (res, next, rules) => validate(req, res, next, rules)
  next()
}

let validate = async (req, res, next, rules) => {

  // allow just rules
  if (!next && !rules) {
    rules = res
    res = null
  }

  // apply each rule
  let errors = {}
  for (let fieldName of Object.keys(rules)) {
    let fieldValue = req.fields ? req.fields[fieldName] : req[fieldName]
    if (fieldName.charAt(0) == ':') fieldValue = req.params[fieldName.slice(1)]
    else if (fieldName.charAt(0) == '?') fieldValue = req.query[fieldName.slice(1)]
    if (!Array.isArray(rules[fieldName])) rules[fieldName] = [rules[fieldName]]
    let fieldErrors = []
    for (let rule of rules[fieldName]) {
      if (rule == 'required' && (fieldValue === null || fieldValue === undefined || fieldValue === '')) fieldErrors.push(`${fieldName} required`)
      if (rule == 'array' && fieldValue && !Array.isArray(fieldValue)) fieldErrors.push(`${fieldName} must be an array`)
      if (rule == 'email' && fieldValue && !fieldValue.match(/.+@.+\..+/)) fieldErrors.push(`${fieldName} must be a valid email address`)
      if (rule == 'fullName' && fieldValue && fieldValue.split(' ').filter(name => name).length < 2) fieldErrors.push(`${fieldName} must contain first and last name`)
      if (rule == 'integer' && isNaN(parseInt(fieldValue))) fieldErrors.push(`${fieldName} must be an integer`)
      if (rule.slice(0, 9) == 'minlength' && fieldValue && fieldValue.length < rule.slice(10)) fieldError.push(`${fieldName} must be at least ${rule.slice(10)} characters`)
      if (rule.slice(0, 9) == 'maxlength' && fieldValue && fieldValue.length > rule.slice(10)) fieldError.push(`${fieldName} must be ${rule.slice(10)} characters or less`)
    }
    if (fieldErrors.length) errors[fieldName] = fieldErrors
  }
  if (Object.keys(errors).length) {
    if (res) return res.status(422).send({errors})
    return errors
  }

  // continue
  if (next) next()

}

module.exports = {
  middleware,
  validate,
}
