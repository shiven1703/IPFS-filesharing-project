const ajv = require('ajv')
const addFormat = require('ajv-formats')

const { InvalidPayload } = require('../utils/customErrors')

const schemaValidator = new ajv()
addFormat(schemaValidator)

schemaValidator.addKeyword({
  async: true,
})

const validate = async (schema, requestBody) => {
  const validate = schemaValidator.compile(schema)
  try {
    const validationResult = await validate(requestBody)
    if (!validationResult) {
      if (validate.errors[0].keyword === 'enum') {
        throw new InvalidPayload(
          `${validate.errors[0].instancePath.substring(1)} ${
            validate.errors[0].message
          }, allowedValues : ${validate.errors[0].params.allowedValues}`
        )
      } else {
        throw new InvalidPayload(validate.errors[0].message)
      }
    } else {
      return requestBody
    }
  } catch (err) {
    throw err
  }
}

module.exports = {
  validate,
}
