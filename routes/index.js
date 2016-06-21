var express = require('express')
var router = express.Router()
var config = require('../config')()

router.get('/', (req, res) => {
  console.log('what');
  res.render('landing')
})

module.exports = router
