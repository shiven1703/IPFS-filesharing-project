const ipfs = require('ipfs-http-client')
const uint8arrays = require('uint8arrays')

const node = ipfs.create(new URL('http://ipfs_host:5001'))

const saveFile = async (filename, buffer) => {
  try {
    await node.files.write(`/${filename}`, buffer, { create: true })
    const fileDetails = await node.files.stat(`/${filename}`)

    return fileDetails.cid.toString()
  } catch (err) {
    console.log(err)
    throw err
  }
}

const fetchFile = async (filename) => {
  try {
    // return fileBuffer
    const fileBuffer = []
    for await (const chunk of node.files.read(`/${filename}`)) {
      fileBuffer.push(chunk)
    }
    return uint8arrays.concat(fileBuffer)
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports = {
  saveFile,
  fetchFile,
}
