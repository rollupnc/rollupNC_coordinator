
exports.up = function (knex, Promise) {
  return knex.schema.createTable('balance', function (t) {
    t.integer('ID').notNullable()
    t.string('pubkeyX').notNullable()
    t.string('pubkeyY').notNullable()
    t.integer('nonce').notNullable()
    t.integer('tokenType').notNullable()
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('balance')
};
