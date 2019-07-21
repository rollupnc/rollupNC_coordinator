'use strict';
const config = require('../config/config.js');
const {attachOnDuplicateUpdate} = require('knex-on-duplicate-update');

async function createDatabase() {
  const knexConfig = require(process.cwd() + '/DB/knexfile');
  knexConfig.connection.database = null;
  const knex = require('knex')(knexConfig);
  attachOnDuplicateUpdate();
  console.log("Creating database ", global.gConfig.db_name);
  try {
    await knex.raw('CREATE DATABASE ' + global.gConfig.db_name);
  } catch (e) {
    if (e.errno === 1007) {
      console.log("DB already exits")
    } else {
      console.log("Error while creating database", e)
    }
  }
  await knex.destroy();
}

createDatabase();
