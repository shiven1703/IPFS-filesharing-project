const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')

module.exports = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )

  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:4000',
        'https://databanken.herokuapp.com',
      ],
      credentials: true,
      exposedHeaders: ['set-cookie'],
    })
  )

  app.use(express.json())

  app.use(cookieParser())

  app.use(express.urlencoded({ extended: false }))

  app.use(express.static('public'))
}
