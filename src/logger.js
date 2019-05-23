const winston = require("winston")
const moment = require("moment")
var config = require("../config/config.js");

const fs = require('fs')
const tsFormat = () => moment().format('YYYY-MM-DD hh:mm:ss')

const logDir = 'log'
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

// colorize the output to the console
const consoleLogger = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  timestamp: tsFormat,
  level: global.gConfig.log_level
})

// File error logger
// const fileInfoLogger = new winston.transports.File({
//   name: 'file-info',
//   filename: `${logDir}/info.log`,
//   timestamp: tsFormat,
//   level: 'info'
// })

const transports = [consoleLogger /*, fileInfoLogger */] // console and file logger
const filters = []
const logger = winston.createLogger({
  filters: filters,
  transports: transports
})

module.exports = logger