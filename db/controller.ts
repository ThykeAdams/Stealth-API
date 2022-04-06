export default class Controller {
  model: any;
  constructor(model: any) {
    this.model = model;
  }

  async create(data = {}) {
    let res = await this.model(data).save();
    //this.setRedis(`${client.config.redis.prefix}:${this.model}`);
    return res;
  }
  async getOne(filter = {}) {
    let res = await this.model.findOne(filter);
    //this.setRedis(`${client.config.redis.prefix}:${this.model}`);
    return res;
  }
  async get(filter = {}) {
    return this.model.find(filter);
  }
  async getAndUpdate(filter = {}, update = {}) {
    return this.model.findOneAndUpdate(filter, update);
  }
  async deleteMany(filter = {}) {
    return this.model.deleteMany(filter);
  }
}
