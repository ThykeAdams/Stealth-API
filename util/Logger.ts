import moment from 'moment'
import color from 'colorts'
export default class Logger {
  constructor() {
    
  }
  get timestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss')
  }
  ready(log: string) {
    console.log(`[${this.timestamp}] ${color('[READY]').green} ${log}`)
  }
  info(log: string) {
    console.log(`[${this.timestamp}] ${color('[INFO]').blue} ${log}`)
  }
  error(log: string) {
    console.log(`[${this.timestamp}] ${color('[ERROR]').red} ${log}`)
  }
  debug(log: string) {
    if (!process.env.DEV) return
    console.log(`[${this.timestamp}] ${color('[DEBUG]').yellow} ${log}`)
  }
}
