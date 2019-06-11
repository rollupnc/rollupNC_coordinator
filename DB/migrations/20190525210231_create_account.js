
exports.up = function (knex, Promise) {
  return knex.schema.createTable('accounts', function (t) {
    t.integer('index').notNullable()
    t.string('pubkeyX').notNullable()
    t.string('pubkeyY').notNullable()
    t.integer('balance').notNullable()
    t.integer('nonce').notNullable()
    t.integer('tokenType').notNullable()
    t.unique('pubkeyX')
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('accounts')
};
