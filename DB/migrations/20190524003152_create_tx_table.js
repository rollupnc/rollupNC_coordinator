
exports.up = function (knex, Promise) {
  return knex.schema.createTable('tx', function (t) {
    t.string('fromX').notNullable()
    t.string('fromY').notNullable()
    t.string('toX').notNullable()
    t.string('toY').notNullable()
    t.string('amount').notNullable()
    t.string('tokenType').notNullable()
    t.string('R1').notNullable()
    t.string('R2').notNullable()
    t.string('S').notNullable()
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('tx')
};
