const fileDAL = require('./file.DAL')
const schema = require('./file.schema')
const validator = require('../../utils/schemaValidator')
const { FileModuleError } = require('./exception/file.exception')

const uploadFiles = async (req, res, next) => {
  try {
    const files = await fileDAL.saveFiles(req.files, req.user)
    return res.status(200).json({
      msg: 'Files uploaded',
      data: {
        files,
      },
    })
  } catch (err) {
    next(err)
  }
}

const preDownload = async (req, res, next) => {
  try {
    if (!req.params.downloadUrlString) {
      throw new FileModuleError('InvalidDownloadURL', 400, 'Invalid Download URL')
    } else {
      const fileMetadata = await fileDAL.fetchFileMetadata(req.params.downloadUrlString)
      // setting relay cookie - to disable direct download of file.
      res.cookie('relay', 'passed', {
        sameSite: 'None',
        secure: true,
        httpOnly: true,
      })
      res.status(200).json({
        msg: '',
        data: {
          file: fileMetadata,
        },
      })
    }
  } catch (err) {
    next(err)
  }
}

const downloadFile = async (req, res, next) => {
  try {
    if (!req.params.downloadUrlString) {
      throw new FileModuleError('InvalidDownloadURL', 400, 'Invalid Download URL')
    } else if (!req.cookies.relay) {
      throw new FileModuleError(
        'InvalidDownloadURL',
        403,
        'Invalid Download URL (Hotlink download disabled)'
      )
    } else {
      const fetchedFile = await fileDAL.fetchFile(req.params.downloadUrlString)
      //content-type header
      res.type(`${fetchedFile.mimetype}`)
      res.header('Content-Disposition', `attachment; filename=${fetchedFile.filename}`)
      // res.status(200).send(Buffer.from(fetchedFile.file, 'base64'))
      res.status(200).send(Buffer.from(fetchedFile.file))
    }
  } catch (err) {
    next(err)
  }
}

const fileRequest = async (req, res, next) => {
  try {
    const requestData = await validator.validate(schema.fileRequestSchema, req.body)
    await fileDAL.addFileRequest(requestData, req.user)
    res.status(200).json({
      msg: 'Request successfully added',
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  uploadFiles,
  preDownload,
  downloadFile,
  fileRequest,
}
