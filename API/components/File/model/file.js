const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    require: true,
  },
  uploadedOn: {
    type: Number,
    require: true,
  },
  lastDownloadedOn: {
    type: Number,
  },
  downloadUrl: {
    type: String,
    required: true,
  },
  fileHash: {
    type: String,
    required: true,
  },
  ipfs_cid: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    required: true,
    default: false,
  },
})

module.exports = mongoose.model('file', fileSchema)
