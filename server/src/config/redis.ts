import { Redis } from '@upstash/redis'

const redisClient= new Redis({
  url: 'https://positive-goldfish-20398.upstash.io',
  token: 'AU-uAAIjcDE3NTE5MzAyNTFhY2M0OGFiYmZiZjJhZTFmMDhkZmNmZHAxMA',
})

export default redisClient