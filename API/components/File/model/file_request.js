const mongoose = require('mongoose')

const FileRequestSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.ObjectId,
    required: true,
  },
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Block', 'Unblock'],
  },
  reason: {
    type: String,
    required: true,
  },
  approvalStatus: {
    type: Number,
    required: true,
    enum: [-1, 1, 0],
  },
})

FileRequestSchema.virtual('request_id').get(function () {
  return this._id
})

FileRequestSchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('file_request', FileRequestSchema)
