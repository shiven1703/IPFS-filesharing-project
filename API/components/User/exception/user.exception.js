class UserModuleError extends Error {
  constructor(errorType, errorCode, message) {
    super(message)
    this.name = 'UserModuleError'
    this.errorType = errorType
    this.errorCode = errorCode
  }
}

module.exports = {
  UserModuleError,
}
