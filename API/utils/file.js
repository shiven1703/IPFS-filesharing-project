const formatFileSize = (fileSize) => {
  const sizes = ['Bytes', 'KB', 'MB']
  if (fileSize === 0) {
    return '0 Byte'
  } else {
    const power = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)))
    return Math.round(fileSize / Math.pow(1024, power), 2) + ' ' + sizes[power]
  }
}

const formatDate = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000)
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(date)
}

module.exports = {
  formatFileSize,
  formatDate,
}
