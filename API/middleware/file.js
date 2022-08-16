const multer = require('multer')

const config = require('config')
const { HttpError } = require('../utils/customErrors')
const storage = multer.memoryStorage()

const fileLimits = {
  fileSize: config.get('modules.file.sizeLimit'),
}

const fileUploader = multer({ storage: storage, limits: fileLimits }).array('files', 5)

const saveUploadedFile = (req, res, next) => {
  fileUploader(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new HttpError('Missing files field', 400))
      }
      return next(err)
    } else if (!req.files) {
      return next(new HttpError('Missing files field', 400))
    } else {
      next()
    }
  })
}

module.exports = saveUploadedFile
