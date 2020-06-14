module.exports = {
  description: 'Express request middleware',
  files: [
    {
      from: 'request.js',
      to: filename => `controller/${request}.js`
    }
  ],
}
