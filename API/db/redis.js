const redis = require('redis')

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
})

client.connect().then(async () => {
  const isConnected = await client.ping()
  if (isConnected === 'PONG') {
    console.log('Connected to redis...')
  } else {
    throw new Error('Error while connecting to redis')
  }
})

module.exports = client
