import Redis, { RedisOptions } from 'ioredis';
import { Request } from 'express';
interface Options {
  redis: Redis;
}
export default class Functions {
  redis: Redis;
  constructor(options: Options) {
    this.redis = options.redis;
  }
  async runCache(key: string, func: Function, returnSole: boolean = true) {
    return new Promise(async (resolve, reject) => {
      try {
        let data: any = await this.redis.get(key);
        if (!data) {
          let response = await func();
          data = { data: response, cached: true };
          this.redis.setex(key, 3600, JSON.stringify(data));
        } else data = JSON.parse(data);
        if (returnSole) return resolve(data.data);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }
  async deleteCache(key: string) {
    return this.redis.del(key);
  }
  parseQuery(req: Request) {
    return {
      url: `?${Object.keys(req.query)
        .map((q) => `${q}=${req.query[q]}`)
        .join('&')}`,
      array: Object.keys(req.query).map((q) => ({
        name: q,
        value: req.query[q]
      })),
      items: req.query
    };
  }
}
