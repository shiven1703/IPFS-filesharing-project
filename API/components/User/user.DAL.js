// models
const User = require('./model/user')
const File = require('../File/model/file')
const FileRequest = require('../File/model/file_request')

// extra
const encypter = require('../../utils/encryption')
const fileUtils = require('../../utils/file')
const token = require('../../utils/token')
const config = require('config')
const { ObjectId } = require('mongoose').Types
const { UserModuleError } = require('./exception/user.exception')

const client = require('../../db/redis')

const addUser = async ({ firstname, lastname, email, password, role, autoLogin = false }) => {
  try {
    const newUser = new User({
      firstname,
      lastname,
      email,
      password,
      role,
    })

    newUser.password = await encypter.makeHash(newUser.password)

    let user = await newUser.save()
    user = user.toObject()

    user.user_id = user._id
    delete user._id
    delete user.password
    delete user.__v

    // auto login on creation
    if (autoLogin) {
      const { access_token } = await authenticateUser({
        email: email,
        password: password,
        userType: 'Normal',
      })
      user.access_token = access_token
    }

    return user
  } catch (err) {
    if (err.code === 11000) {
      throw new UserModuleError(
        'DBValidationError',
        409,
        'User already exist with same email address.'
      )
    } else if ('errors' in err && err.errors.role.kind === 'enum') {
      throw new UserModuleError('InvalidUserRole', 400, err.errors.role.message)
    } else {
      throw err
    }
  }
}

const authenticateUser = async ({ email, password, userType }) => {
  try {
    const user = await User.findOne({ email: email, role: userType })
    if (user) {
      const isValidPassword = await validateUserPassword(password, user.password)
      if (isValidPassword) {
        const token = await generateToken(user)
        return {
          user_id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          access_token: token,
        }
      }
    }
    throw new UserModuleError('InvalidUser', 401, 'Invalid Username or password.')
  } catch (err) {
    throw err
  }
}

const validateUserPassword = async (userPassword, passwordHash) => {
  try {
    const isValidPassword = await encypter.validateHash(userPassword, passwordHash)
    return isValidPassword
  } catch (err) {
    throw err
  }
}

const generateToken = async ({ _id: user_id, role }) => {
  try {
    user_id = user_id.toString()

    const access_token = await token.generateAccessToken({
      user_id: user_id,
      role: role,
    })

    return `Bearer ${access_token}`
  } catch (err) {
    throw err
  }
}

const getFiles = async ({ user_id }) => {
  try {
    let files = await File.find({ userId: ObjectId(user_id) })
      .select(['-__v', '-file', '-fileHash', '-lastDownloadedOn'])
      .lean()

    // formating
    files = files.map((file) => {
      file.file_id = file._id

      file.uploadedOn = fileUtils.formatDate(file.uploadedOn)
      file.size = fileUtils.formatFileSize(file.size)
      file.downloadUrl = `${config.get('app.endpoint')}/file/view${file.downloadUrl}`

      delete file._id
      delete file.userId

      return file
    })

    return files
  } catch (err) {
    throw new UserModuleError(
      'FileFetchingError',
      500,
      'Somthing went wrong while fetching user files. Please try again !'
    )
  }
}

const deleteFile = async (fileId, requestingUser) => {
  try {
    const file = await File.findOne({
      _id: ObjectId(fileId),
      userId: ObjectId(requestingUser.user_id),
    })
      .select(['-file'])
      .lean()

    if (file) {
      // removing file
      await File.deleteOne({ _id: fileId })
      // removing cache
      await client.del(file.fileHash)
      console.log('file status removed from cache : delete operation')
      // remvoing file requests
      await FileRequest.deleteMany({ fileId: ObjectId(file._id) })

      return true
    } else {
      throw new UserModuleError('InvalidFileRequest', 400, 'Invalid file_id')
    }
  } catch (err) {
    if (err.name === 'BSONTypeError') {
      throw new UserModuleError('InvalidFileRequest', 400, 'Invalid file_id')
    }
    throw err
  }
}

module.exports = {
  addUser,
  authenticateUser,
  getFiles,
  deleteFile,
}
