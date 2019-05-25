
exports.up = function (knex, Promise) {
  return knex.schema.createTable('balance', function (t) {
    t.string('ID').notNullable()
    t.string('pubkeyX').notNullable()
    t.string('pubkeyY').notNullable()
    t.string('nonce').notNullable()
    t.string('tokenType').notNullable()
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('balance')
};
