const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const databaseConnection = require('../../../db')

chai.use(chaiHttp)
const app = require('../../../app')

// login tests
describe('/POST /admin/login', () => {
  const endpoint = '/admin/login'

  const superAdmin = {
    email: 'admin@gmail.com',
    password: '159357',
  }

  before(async () => {
    await databaseConnection()
  })

  // invalid json test
  it('Should not accept invalid JSON payload', (done) => {
    const invalidJSON = '{"invalidJSON",}'

    chai
      .request(app)
      .post(endpoint)
      .type('json')
      .send(invalidJSON)
      .end((err, response) => {
        expect(err).to.be.null
        response.should.have.status(400)
        response.body.should.be.a('object')
        response.body.should.have.property('error')
        done()
      })
  })

  // incoming json validation test
  it('Should validate incoming JSON payload for required properties', (done) => {
    const invalidUserPayload = {}
    const userWihoutEmail = {
      password: '12345',
    }
    const userWithInvalidEmailFormat = {
      email: 'lol',
      password: '123456',
    }
    const userWihoutPassword = {
      email: 'sample@gmail.com',
    }

    const requester = chai.request(app).keepOpen()

    Promise.all([
      requester.post(endpoint).type('json').send(invalidUserPayload),
      requester.post(endpoint).type('json').send(userWihoutEmail),
      requester.post(endpoint).type('json').send(userWihoutPassword),
      requester.post(endpoint).type('json').send(userWithInvalidEmailFormat),
    ]).then((response) => {
      response.forEach((individualResponse) => {
        individualResponse.should.have.status(400)
        individualResponse.body.should.be.a('object')
        individualResponse.body.should.have.property('error')
      })
      requester.close()
      done()
    })
  })

  // invalid credentials test
  it('Should not allow access with wrong email and password', (done) => {
    const user = {
      email: 'lol@gmail.com',
      password: '000000',
    }

    chai
      .request(app)
      .post(endpoint)
      .type('json')
      .send(user)
      .end((err, response) => {
        expect(err).to.be.null
        response.should.have.status(401)
        response.body.should.be.a('object')
        response.body.should.not.have.property('access_token')
        done()
      })
  })

  // successful login check
  it('Should return access_token with correct credentials', (done) => {
    chai
      .request(app)
      .post(endpoint)
      .type('json')
      .send(superAdmin)
      .end((err, response) => {
        expect(err).to.be.null
        response.should.have.status(200)
        response.body.should.be.a('object')
        expect(response).to.have.nested.property('body.data.user.access_token')
        done()
      })
  })
})

// request listing test
describe('/GET /admin/requests', () => {
  let adminToken = ''

  before(async () => {
    const superAdmin = {
      email: 'admin@gmail.com',
      password: '159357',
    }

    const response = await chai.request(app).post('/admin/login').type('json').send(superAdmin)
    adminToken = JSON.parse(response.text).data.user.access_token
  })

  it('Should return list of requests', (done) => {
    chai
      .request(app)
      .get('/admin/requests')
      .set('authorization', adminToken)
      .send()
      .end((err, response) => {
        expect(err).to.be.null
        response.should.have.status(200)
        response.body.should.be.a('object')
        expect(response).to.have.nested.property('body.data.requests')
        done()
      })
  })
})
