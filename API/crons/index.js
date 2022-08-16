const cron = require('node-cron')
const config = require('config')

const fileDAL = require('../components/File/file.DAL')

module.exports = () => {
  // runs every day
  cron.schedule('0 0 * * *', fileDAL.removeNonuseFiles, {
    timezone: config.get('crons.timezone'),
  })
}
