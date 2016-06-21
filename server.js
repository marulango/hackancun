// IMPORTS
  var express = require('express')
  var swig = require('swig')
  var config = require('./config')()
  var path = require('path')

// CONFIGURATIONS
  var app = express()
  app.set('port', config.port)
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'html')
  app.set('view cache', false)
  app.engine('html', swig.renderFile)
  swig.setDefaults({ cache: false })

// ROUTES
  var routes = require('./routes/index')
  app.use('/', routes);
  app.use(express.static(path.join(__dirname, 'public')))

// LAUNCHING APP
  var server = app.listen(config.port, () => {
    console.log('Servidor escuchando en ' + config.port)
  })
  module.exports = app
