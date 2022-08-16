class FileModuleError extends Error {
  constructor(errorType, errorCode, message) {
    super(message)
    this.name = 'FileModuleError'
    this.errorType = errorType
    this.errorCode = errorCode
  }
}

module.exports = {
  FileModuleError,
}
