module.exports = (err, req, res, next) => {
  if (err.name === 'AdminModuleError') {
    res.status(err.errorCode).json({
      error: err.message,
    })
  } else {
    next(err)
  }
}
