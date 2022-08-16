const userSchema = {
  type: 'object',
  properties: {
    firstname: {
      type: 'string',
    },
    lastname: {
      type: 'string',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
    },
    role: {
      type: 'string',
      enum: ['Normal'],
    },
    autoLogin: {
      type: 'boolean',
      default: false,
    },
  },
  required: ['firstname', 'lastname', 'email', 'password', 'role'],
  additionalProperties: false,
}

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

module.exports = {
  userSchema,
  loginSchema,
}
