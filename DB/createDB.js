'use strict';
const config = require('../config/config.js');
async function createDatabase() {
  const knexConfig = require(process.cwd() + '/DB/knexfile');
  knexConfig.connection.database = null;
  const knex = require('knex')(knexConfig);
  console.log("Creating database ", global.gConfig.db_name);
  await knex.raw('CREATE DATABASE ' + global.gConfig.db_name);
  await knex.destroy();
}

createDatabase();
