module.exports = {
  description: 'Express controller',
  files: [
    {
      from: 'controller.js',
      to: filename => `controller/${filename}.js`
    }
  ],
}
