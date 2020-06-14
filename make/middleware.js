module.exports = {
  description: 'Express middleware',
  files: [
    {
      from: 'middleware.js',
      to: filename => `controller/${middleware}.js`
    }
  ],
}
