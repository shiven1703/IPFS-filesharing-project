const homeComponent = require('../components/Home')
const userComponent = require('../components/User')
const adminComponent = require('../components/Admin')
const fileComponent = require('../components/File')
const errorHandler = require('../middleware/error')

module.exports = (app) => {
  app.use('/user', userComponent)
  app.use('/admin', adminComponent)
  app.use('/file', fileComponent)
  app.use('/', homeComponent)
  app.use(errorHandler)
}
