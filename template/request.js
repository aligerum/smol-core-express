module.exports = async (req, res, next) => {
  req.validate(res, next, {
    // ':id': ['required', 'integer'],
    // '?page': ['required', 'integer'],
    // email: ['required', 'email'],
  })
}
