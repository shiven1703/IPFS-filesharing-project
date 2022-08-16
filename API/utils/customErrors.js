class InvalidPayload extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidPayload'
  }
}

class JwtError extends Error {
  constructor(message) {
    super(message)
    this.name = 'JwtError'
  }
}

class MissingHeader extends Error {
  constructor(message) {
    super(message)
    this.name = 'MissingHeader'
  }
}

class HttpError extends Error {
  constructor(message, httpErrorCode) {
    super(message)
    this.name = 'HttpError'
    this.httpErrorCode = httpErrorCode
  }
}

module.exports = {
  InvalidPayload,
  MissingHeader,
  JwtError,
  HttpError,
}
