/**
 * The Database used by the client
 */
// const models: any = {
//   SongData: require('./controller'),
// }
import Controller from './controller'
import path from 'path'
const models = ['tmp']

export default class DBLoader {
  constructor() {}
  async loadModels() {
    let newModels: any = {}
    await Promise.all(
      models.map(async (model) => {
          
        const newModel = await import(path.join(__dirname, `/models/${model.toLowerCase()}`))
        newModels[model.toLowerCase()] = new Controller(newModel.default)
      })
    )

    return newModels
  }
}