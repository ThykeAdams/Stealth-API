import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS || '');
redis.once('ready', () => {
  redis.flushdb();
  console.log('Flushed');
  process.exit(0);
});
