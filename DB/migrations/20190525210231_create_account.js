
exports.up = function (knex, Promise) {
  return knex.schema.createTable('accounts', function (t) {
    t.increments();
    t.string('pubkeyX').notNullable()
    t.string('pubkeyY').notNullable()
    t.integer('balance').notNullable()
    t.string('nonce').notNullable()
    t.string('tokenType').notNullable()
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('accounts')
};
