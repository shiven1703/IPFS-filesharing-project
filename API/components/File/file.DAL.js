const File = require('./model/file')
const FileRequest = require('./model/file_request')

const ipfs = require('../Ipfs')

const random = require('../../utils/random')
const fileUtils = require('../../utils/file')
const { createHash } = require('crypto')
const config = require('config')

const { FileModuleError } = require('./exception/file.exception')

const saveFiles = async (files, user) => {
  try {
    const fileList = []
    let failedUploadCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filename = file.originalname
      const mimetype = file.mimetype
      // const fileInBase64 = Buffer.from(file.buffer).toString('base64')
      const fileBuffer = file.buffer
      const randomDownloadUrl = await random.generateRandomString(20)
      const unixTimestamp = Math.floor(+new Date() / 1000)
      // const fileHash = generateFileHash(fileInBase64)
      const fileHash = generateFileHash(fileBuffer)

      // checking if already exist or not
      const fileCount = await File.countDocuments({
        fileHash: fileHash,
        userId: user.user_id,
      })

      if (fileCount > 0) {
        failedUploadCount++
        continue
      }

      // uploding file to ipfs network and fetching cid for the uploaded file
      const ipfs_cid = await ipfs.saveFile(filename, fileBuffer)

      const newFile = new File({
        filename,
        userId: user.user_id,
        mimetype,
        size: file.size,
        uploadedOn: unixTimestamp,
        lastDownloadedOn: unixTimestamp,
        downloadUrl: `/${randomDownloadUrl}`,
        fileHash,
        ipfs_cid,
        isBlocked: false,
      })

      const { downloadUrl, ...rest } = await newFile.save()
      fileList.push({
        filename,
        downloadUrl: `${config.get('app.endpoint')}/file/view${downloadUrl}`,
      })
    }

    return fileList
  } catch (err) {
    if (err.code === 11000) {
      throw new FileModuleError('DBValidationError', 409, 'Cannot upload same file again.')
    }
    throw err
  }
}

const fetchFileMetadata = async (downloadUrlString) => {
  try {
    const file = await File.findOne({ downloadUrl: `/${downloadUrlString}` })
      .select(['-lastDownloadedOn', '-downloadUrl', '-file', '-userId', '-__v'])
      .lean()

    if (file) {
      file.file_id = file._id
      file.size = fileUtils.formatFileSize(file.size)
      file.uploadedOn = fileUtils.formatDate(file.uploadedOn)
      file.status = await getFileStatus(file.fileHash)
      delete file._id
      delete file.fileHash
      return file
    } else {
      throw new FileModuleError(
        'FileNotFound',
        404,
        'File not found. Please check your download URL'
      )
    }
  } catch (err) {
    throw err
  }
}

const fetchFile = async (downloadUrlString) => {
  try {
    const downloadTimestamp = Math.floor(+new Date() / 1000)
    const fileDetails = await File.findOne({ downloadUrl: `/${downloadUrlString}` })
      .select(['ipfs_cid', 'mimetype', 'filename', 'fileHash'])
      .lean()
    const fileStatus = await getFileStatus(fileDetails.fileHash)

    if (fileDetails && fileStatus === 'Unblocked') {
      await File.updateOne(
        { downloadUrl: `/${downloadUrlString}` },
        { lastDownloadedOn: downloadTimestamp }
      )
      const file = await ipfs.fetchFile(fileDetails.filename)
      return { ...fileDetails, file }
    } else if (fileStatus === 'Blocked') {
      throw new FileModuleError(
        'FileBlocked',
        403,
        'Cannot download file. The current file status is "Blocked"'
      )
    } else {
      throw new FileModuleError(
        'FileNotFound',
        404,
        'File not found. Please check your download URL'
      )
    }
  } catch (err) {
    throw err
  }
}

const removeNonuseFiles = async () => {
  try {
    const files = await File.find({}).select(['lastDownloadedOn', '_id'])

    const inactiveFiles = []
    files.forEach((file) => {
      if (isFileInActive(file.lastDownloadedOn, 14)) {
        // console.log(file._id)
        inactiveFiles.push(file._id)
      }
    })

    await File.deleteMany({ _id: { $in: inactiveFiles } })
    console.log('CRON: Removed inactive files')

    return true
  } catch (err) {
    throw new FileModuleError(
      'Cron Job Error',
      500,
      'Non-use file removing cron job failed to run.'
    )
  }
}

const isFileInActive = (lastDownloadeOn, inactiveDaysLimit) => {
  let currentDate = new Date()

  lastDownloadeOn = new Date(lastDownloadeOn * 1000) //unix to date obj

  let diffInMiliSeconds = currentDate.getTime() - lastDownloadeOn.getTime()
  let diffInDays = Math.ceil(diffInMiliSeconds / (1000 * 3600 * 24))

  if (diffInDays > inactiveDaysLimit) {
    return true
  } else {
    return false
  }
}

const addFileRequest = async (requestData, userData) => {
  try {
    const [file, existingRequest] = await Promise.all([
      File.findOne({ _id: requestData.file_id }).select(['_id']),
      FileRequest.findOne({
        fileId: requestData.file_id,
        type: requestData.request_type,
        approvalStatus: -1,
      }),
    ])

    if (file && !existingRequest) {
      const request = new FileRequest({
        fileId: requestData.file_id,
        userId: userData.user_id,
        type: requestData.request_type,
        reason: requestData.reason,
        approvalStatus: -1,
      })

      await request.save()
    } else {
      if (!file) {
        throw new FileModuleError(
          'FileNotFound',
          404,
          'Failed to add request on supplied file_id. Invalid file_id'
        )
      } else if (existingRequest) {
        throw new FileModuleError(
          'DuplicateFileRequest',
          409,
          'Request already added for this file.'
        )
      }
    }
  } catch (err) {
    if (err.kind === 'ObjectId') {
      throw new FileModuleError('FileNotFound', 404, 'Invalid file_id supplied.')
    }
    throw err
  }
}

const blockFile = async (fileHash) => {
  try {
    await File.updateOne({ fileHash: fileHash }, { isBlocked: true })
  } catch (err) {
    throw FileModuleError(
      'FailedBlockingFile',
      500,
      'Somthing went wrong while blocking file. Please try again !'
    )
  }
}

const unblockFile = async (fileHash) => {
  try {
    await File.updateOne({ fileHash: fileHash }, { isBlocked: false })
  } catch (err) {
    throw FileModuleError(
      'FailedUnblockingFile',
      500,
      'Somthing went wrong while unblocking file. Please try again !'
    )
  }
}

const getFileStatus = async (fileHash) => {
  try {
    const file = await File.findOne({ fileHash: fileHash }).select(['isBlocked']).lean()
    if (file.isBlocked) {
      return 'Blocked'
    } else {
      return 'Unblocked'
    }
  } catch (err) {
    throw FileModuleError(
      'FileStatusCheckError',
      500,
      'Somthing went wrong while fetching file status. Please try again !'
    )
  }
}

const generateFileHash = (file) => {
  try {
    return createHash('sha256').update(file).digest('hex')
  } catch (err) {
    throw FileModuleError(
      'FileHashGenerationError',
      500,
      'Somthing went wrong while generating file hash. Please try again !'
    )
  }
}

module.exports = {
  saveFiles,
  fetchFileMetadata,
  fetchFile,
  removeNonuseFiles,
  addFileRequest,
  blockFile,
  unblockFile,
  getFileStatus,
}
