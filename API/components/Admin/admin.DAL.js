const userDAL = require('../User/user.DAL')
const File = require('../File/model/file')
const FileRequest = require('../File/model/file_request')
const FileDAL = require('../File/file.DAL')
const client = require('../../db/redis')

const { AdminModuleError } = require('./exception/admin.exception')
const fileUtils = require('../../utils/file')

const authenticateAdmin = async (loginData) => {
  try {
    const user = await userDAL.authenticateUser(loginData)
    return user
  } catch (err) {
    throw new AdminModuleError('InvalidUser', 401, 'Invalid Username or password.')
  }
}

const getFileRequests = async () => {
  try {
    const requests = await FileRequest.aggregate([
      { $match: { approvalStatus: -1 } },
      {
        $lookup: {
          from: 'files',
          localField: 'fileId',
          foreignField: '_id',
          as: 'file_details',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user_details',
        },
      },
      {
        $project: {
          _id: 0,
          request_id: '$_id',
          file_id: '$fileId',
          type: 1,
          reason: 1,
          approvalStatus: 1,
          'file_details.filename': 1,
          'file_details.mimetype': 1,
          'file_details.size': 1,
          'file_details.uploadedOn': 1,
          'file_details.lastDownloadedOn': 1,
          'file_details.downloadUrl': 1,
          'user_details.firstname': 1,
          'user_details.lastname': 1,
          'user_details.email': 1,
        },
      },
    ])

    return requests.map((request) => {
      const fileDetails = request.file_details[0]
      const userDetails = request.user_details[0]
      fileDetails.uploadedOn = fileUtils.formatDate(fileDetails.uploadedOn)
      fileDetails.lastDownloadedOn = fileUtils.formatDate(fileDetails.lastDownloadedOn)
      fileDetails.size = fileUtils.formatFileSize(fileDetails.size)
      request.file_details = fileDetails

      request.user_details = userDetails

      return request
    })
  } catch (err) {
    throw err
  }
}

const processRequest = async (requestData) => {
  try {
    const request = await FileRequest.findOne({
      _id: requestData.request_id,
      approvalStatus: -1,
    }).lean()

    if (request) {
      const file = await File.findOne({ _id: request.fileId })

      if (requestData.operation === 'Approve') {
        // invalidating cache for file status
        await client.del(file.fileHash)
        console.log('cache invalidated for the file')
        if (request.type === 'Block') {
          await FileDAL.blockFile(file.fileHash)
        } else {
          await FileDAL.unblockFile(file.fileHash)
        }
        await FileRequest.updateOne({ _id: request._id }, { approvalStatus: 1 })
      } else {
        await FileRequest.updateOne({ _id: request._id }, { approvalStatus: 0 })
      }
    } else {
      throw new AdminModuleError('InvalidFileRequest', 400, 'Invalid request_id received')
    }
  } catch (err) {
    if (err.kind === 'ObjectId') {
      throw new AdminModuleError('InvalidFileRequest', 400, 'Invalid file_id received')
    }
    throw err
  }
}

module.exports = {
  authenticateAdmin,
  getFileRequests,
  processRequest,
}
