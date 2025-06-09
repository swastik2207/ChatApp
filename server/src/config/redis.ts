import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: 'https://positive-goldfish-20398.upstash.io',
  token: 'AU-uAAIjcDE3NTE5MzAyNTFhY2M0OGFiYmZiZjJhZTFmMDhkZmNmZHAxMA',
})

export default redis;