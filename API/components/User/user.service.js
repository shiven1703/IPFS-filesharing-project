const schema = require('./user.schema')
const userDAL = require('./user.DAL.js')
const validator = require('../../utils/schemaValidator')

const createUser = async (req, res, next) => {
  try {
    const user = await validator.validate(schema.userSchema, req.body)
    const newUser = await userDAL.addUser(user)
    res.status(201).json({
      msg: 'User created',
      data: {
        user: newUser,
      },
    })
  } catch (err) {
    next(err)
  }
}

const userLogin = async (req, res, next) => {
  try {
    const loginData = await validator.validate(schema.loginSchema, req.body)
    loginData.userType = 'Normal'
    const user = await userDAL.authenticateUser(loginData)
    res.status(200).json({
      msg: 'Login Successful',
      data: {
        user,
      },
    })
  } catch (err) {
    next(err)
  }
}

const getUserFiles = async (req, res, next) => {
  try {
    const files = await userDAL.getFiles(req.user)
    res.status(200).json({
      msg: 'Success',
      data: {
        files,
      },
    })
  } catch (err) {
    next(err)
  }
}

const deleteFile = async (req, res, next) => {
  try {
    await userDAL.deleteFile(req.params.file_id, req.user)
    res.status(200).json({
      msg: 'Success',
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createUser,
  userLogin,
  getUserFiles,
  deleteFile,
}
