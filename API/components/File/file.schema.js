const fileRequestSchema = {
  type: 'object',
  properties: {
    file_id: {
      type: 'string',
    },
    request_type: {
      type: 'string',
      enum: ['Block', 'Unblock'],
    },
    reason: {
      type: 'string',
    },
  },
  required: ['file_id', 'request_type', 'reason'],
  additionalProperties: false,
}

module.exports = {
  fileRequestSchema,
}
