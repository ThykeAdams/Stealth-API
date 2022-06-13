import Redis, { RedisOptions } from 'ioredis';
import { Request } from 'express';
import { Server, ServerOptions, Socket } from 'socket.io';
interface Options {
  redis: Redis;
  socket: Server;
}
interface RunCacheOptions {
  returnSole: boolean;
  expire: number;
}
export default class Functions {
  redis: Redis;
  socket: Server;
  constructor(options: Options) {
    this.redis = options.redis;
    this.socket = options.socket;
  }
  async emitAll(key: string, data: any) {
    return this.socket.emit(key, data);
  }
  async runCache(key: string, func: Function, options: RunCacheOptions = {returnSole: false, expire: 3600}) {
    return new Promise(async (resolve, reject) => {
      try {
        let data: any = await this.redis.get(key);
        if (!data) {
          let response = await func();
          data = { data: response, cached: true };
          this.redis.setex(key, options.expire, JSON.stringify(data));
        } else data = JSON.parse(data);
        if (options.returnSole) return resolve(data.data);
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
