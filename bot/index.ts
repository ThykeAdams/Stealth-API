import { Client } from 'discord.js';
import Redis from 'ioredis';
import Functions from '../util/Funcs';
import Logger from '../util/Logger';

interface ClientOptions {
  db: any;
  redis: Redis;
  funcs: Functions;
  logger: Logger;
}
export default class BotClient {
  db: any;
  redis: Redis;
  funcs: Functions;
  logger: Logger;
  client: Client<boolean>;
  constructor({ db, redis, funcs, logger }: ClientOptions) {
    this.db = db;
    this.redis = redis;
    this.funcs = funcs;
    this.logger = logger;

    this.client = new Client({
      intents: 131071
    });

    this.client.login(process.env.V1_DISCORD_TOKEN);
  }
}
