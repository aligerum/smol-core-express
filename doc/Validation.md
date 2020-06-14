# Validator

User input data must be validated before inserting into a database or otherwise being used.

This is done by providing rules to the request's `validate` function. This function will attempt to validate the data based on the input rules, and if invalid, will automatically return an appropriate error response and prevent the request from continuing.

If the data is valid, it will proceed to the next middleware.

# Rules

The validator is capable of validating route parameters, url query values, and request body fields. Parameter keys start with `:` just like within a url. For example, `resource/user/:user` can be validated to have an integer as the `:user` parameter by providing the rule `':user': ['required', 'integer']` to the `validate` function.

Query values start with `?`. For example, `results?page=5&rows=10` can be validated to have integer values by providing `'?page': ['required', 'integer']` and `'?rows': ['required', 'integer']`.

Fields within form POST data or any data otherwise submitted as body data such as json are validated with no preceeding symbol, so a form that has input elements with name `firstName` and `lastName` can be validated with `firstName: ['required', 'string']` and `lastName: ['required', 'string']`.

Rules can also have arguments with them separated by spaces. For instance, `minlength 8` will use the `minlength` rule, passing `8` as the minimum length.

# Arguments

The `validate` function is automatically made available all on `req` objects. It takes 3 arguments, the `res` object, the `next` object (for when used within middleware), then the `rules` definition object. This is an example of a typical request middleware:

```js
module.exports = async (req, res, next) => {
  req.validate(res, next, {
    ':id': ['required', 'integer'],
    '?page': ['required', 'integer'],
    email: ['required', 'email'],
  })
}
```

Both `res` and `next` are optional parameters. Set `res` to `null` to prevent automatically sending the error response and instead return an object detailing the errors, where each key is a name, and each value is an error message (for example: `{':id': [':id must be an integer']}`. Each key that has an error will have an array defined containing a message for each error for that key.

Set `next` to null to prevent automatically going to the next middleware (useful when more things need to be validated) within the request.

You can also just pass the rules as a single argument to the validate function to prevent having to pass two null values for `res` and `next`.

Example:

```js
module.exports = async (req, res, next) => {
  let errors = req.validate({
    ':id': ['integer'],
  })
  if (errors) return res.status(422).send({errors})
  next()
}
```

You can also use the validate function outside of requests. In this case, you'll need to pass the object to be validated in as the first argument.

```js
const smolCoreExpress = require('smol-core-express')

let def = {
  id: 5,
}

let errors = smolCoreExpress.validate(def, {
  id: ['required', 'integer'],
})
```

# All Rules

The following Rules are available:

| Rule | Description |
| --- | --- |
| array | Field must be an array |
| email | Field must be formatted as an email address |
| fullName | Field must have a first name and a last name (can also have middle names) |
| integer | Field must be an integer value |
| maxlength n | Field must be at most n characters |
| minlength n | Field must be at least n characters |
| required | Require that the field is defined and is not null or '' |
