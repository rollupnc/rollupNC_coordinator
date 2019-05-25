var config = require('./knexfile.js');
var knex = require('knex')(config);

export default knex
