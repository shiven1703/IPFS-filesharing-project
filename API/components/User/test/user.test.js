const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const User = require('../model/user')
const databaseConnection = require('../../../db')
const app = require('../../../app')

const should = chai.should()

chai.use(chaiHttp)

// manual super admin entry test
describe('User', () => {
  before(async () => {
    await databaseConnection()
  })

  it('Manual super admin entry found in the database', async () => {
    const superAdmin = await User.findOne({
      firstname: 'Admin',
      lastname: 'Admin',
      role: 'Admin',
    })
    should.exist(superAdmin)
  })
})

// login tests
describe('/POST /user/login', () => {
  let createdTempUser = {}

  const tempUser = {
    firstname: 'Temp',
    lastname: 'Temp',
    email: 'temp@gmail.com',
    password: '159357',
    role: 'Normal',
  }

  before((done) => {
    chai
      .request(app)
      .post('/user')
      .type('json')
      .send(tempUser)
      .end((err, response) => {
        createdTempUser = response.body.data.user
        done()
      })
  })

  // invalid json test
  it('Should not accept invalid JSON payload', (done) => {
    const invalidJSON = '{"invalidJSON",}'

    chai
      .request(app)
      .post('/user/login')
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
      requester.post('/user/login').type('json').send(invalidUserPayload),
      requester.post('/user/login').type('json').send(userWihoutEmail),
      requester.post('/user/login').type('json').send(userWihoutPassword),
      requester.post('/user/login').type('json').send(userWithInvalidEmailFormat),
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
      .post('/user/login')
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
    const user = {
      email: 'temp@gmail.com',
      password: '159357',
    }

    chai
      .request(app)
      .post('/user/login')
      .type('json')
      .send(user)
      .end((err, response) => {
        expect(err).to.be.null
        response.should.have.status(200)
        response.body.should.be.a('object')
        expect(response).to.have.nested.property('body.data.user.access_token')
        done()
      })
  })

  after(async () => {
    await User.deleteOne({ _id: createdTempUser.user_id })
  })
})

// user creation tests
describe('/POST /user', () => {
  let temporarilyCreatedNormalUser = {}

  const sampleUser = {
    firstname: 'Sample',
    lastname: 'User',
    email: 'sample.user@gmail.com',
    password: 'letmein@123',
    role: 'Normal',
    autoLogin: true,
  }

  before((done) => {
    chai
      .request(app)
      .post('/user')
      .type('json')
      .send(sampleUser)
      .end((err, response) => {
        temporarilyCreatedNormalUser = response.body.data.user
        done()
      })
  })

  // incoming json payload validation test
  it('Should check for all required properties of incoming JSON payload', (done) => {
    const invalidUserPayload = {
      email: 'lol@gmail.com',
    }

    chai
      .request(app)
      .post('/user')
      .type('json')
      .send(invalidUserPayload)
      .end((err, response) => {
        expect(err).to.be.null
        response.should.have.status(400)
        response.body.should.be.a('object')
        response.body.should.have.property('error')
        done()
      })
  })

  // role validation test
  it('Should check for invalid user role', (done) => {
    const invalidUserPayload = {
      firstname: 'Sample',
      lastname: 'User',
      email: 'sample.user@gmail.com',
      password: 'letmein@123',
      role: 'Invalid_role',
    }

    chai
      .request(app)
      .post('/user')
      .type('json')
      .send(invalidUserPayload)
      .end((err, response) => {
        expect(err).to.be.null
        response.should.have.status(400)
        response.body.should.be.a('object')
        response.body.should.have.property('error')
        done()
      })
  })

  // existing user test
  it('Should check for existing user with same email address', (done) => {
    chai
      .request(app)
      .post('/user')
      .type('json')
      .send(sampleUser)
      .end((err, response) => {
        expect(err).to.be.null
        response.should.have.status(409)
        response.body.should.be.a('object')
        response.body.should.have.property('error')
        done()
      })
  })

  // new user registration test
  it('Should create new user', (done) => {
    User.deleteOne({ _id: temporarilyCreatedNormalUser.user_id }, () => {
      chai
        .request(app)
        .post('/user')
        .type('json')
        .send(sampleUser)
        .end((err, response) => {
          expect(err).to.be.null
          response.should.have.status(201)
          response.body.should.be.a('object')
          response.body.should.have.property('data')
          response.body.should.have.property('msg')
          expect(response).to.have.nested.property('body.data.user.user_id')
          expect(response).to.have.nested.property('body.data.user.firstname')
          expect(response).to.have.nested.property('body.data.user.lastname')
          expect(response).to.have.nested.property('body.data.user.email')
          expect(response).to.have.nested.property('body.data.user.role')
          temporarilyCreatedNormalUser = response.body.data.user
          done()
        })
    })
  })

  after(async () => {
    await User.deleteOne({ _id: temporarilyCreatedNormalUser.user_id })
  })
})
