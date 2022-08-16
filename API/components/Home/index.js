const express = require('express')

const router = express.Router()

router.all('/', (req, res) => {
  res.send({
    msg: 'Databanken project API home.',
    hit: 'Success',
  })
})

router.all('/*', (req, res) => {
  res.send({
    msg: 'Unknown endpoint',
  })
})

module.exports = router
