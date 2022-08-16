class AdminModuleError extends Error {
  constructor(errorType, errorCode, message) {
    super(message)
    this.name = 'AdminModuleError'
    this.errorType = errorType
    this.errorCode = errorCode
  }
}

module.exports = {
  AdminModuleError,
}
