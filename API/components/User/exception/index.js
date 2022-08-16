module.exports = (err, req, res, next) => {
  if (err.name === 'UserModuleError') {
    res.status(err.errorCode).json({
      error: err.message,
    })
  } else {
    next(err)
  }
}
