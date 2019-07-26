const {attachOnDuplicateUpdate} = require('knex-on-duplicate-update');

var config = require('./knexfile.js');
var knex = require('knex')(config);
attachOnDuplicateUpdate();

export default knex
