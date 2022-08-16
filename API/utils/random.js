const generateRandomString = async (length) => {
  let randomString = ''

  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charLength = char.length

  for (var i = 0; i < length; i++) {
    randomString += char.charAt(Math.floor(Math.random() * charLength))
  }
  return randomString
}

module.exports = {
  generateRandomString,
}
