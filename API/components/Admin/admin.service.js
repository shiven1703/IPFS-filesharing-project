const schema = require('./admin.schema')
const adminDAL = require('./admin.DAL')
const validator = require('../../utils/schemaValidator')

const adminLogin = async (req, res, next) => {
  try {
    const loginData = await validator.validate(schema.loginSchema, req.body)
    loginData.userType = 'Admin'
    const user = await adminDAL.authenticateAdmin(loginData)
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

const getFileRequests = async (req, res, next) => {
  try {
    const requests = await adminDAL.getFileRequests()
    res.status(200).json({
      msg: 'Success',
      data: {
        requests: requests,
      },
    })
  } catch (err) {
    next(err)
  }
}

const processFileRequest = async (req, res, next) => {
  try {
    const requestData = await validator.validate(schema.fileProcessingSchema, req.body)
    await adminDAL.processRequest(requestData)
    res.status(200).json({
      msg: 'Success',
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  adminLogin,
  getFileRequests,
  processFileRequest,
}
