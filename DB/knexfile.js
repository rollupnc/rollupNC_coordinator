var config = require('../config/config.js')

module.exports = {
  client: 'mysql',
  connection: {
    user: global.gConfig.user,
    password: global.gConfig.password,
    database: global.gConfig.db_name
  },
  migrations: {
    directory: './DB/migrations',
  },
}