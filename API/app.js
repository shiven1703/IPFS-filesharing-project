const express = require('express')

const middleware = require('./middleware')
const routes = require('./routes')
const crons = require('./crons')

const app = express()

middleware(app)

routes(app)

crons()

module.exports = app
