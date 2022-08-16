const loginSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
    },
  },
  required: ['email', 'password'],
  additionalProperties: false,
}

const fileProcessingSchema = {
  type: 'object',
  properties: {
    request_id: {
      type: 'string',
    },
    operation: {
      type: 'string',
      enum: ['Approve', 'Decline'],
    },
  },
  required: ['request_id', 'operation'],
  additionalProperties: false,
}

module.exports = {
  loginSchema,
  fileProcessingSchema,
}
