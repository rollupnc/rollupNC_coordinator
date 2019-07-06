
exports.up = function (knex, Promise) {
  return knex.schema.createTable('tx', function (t) {
    t.string('hash').notNullable().primary().unique()
    t.string('fromX').notNullable()
    t.string('fromY').notNullable()
	  t.integer('fromIndex').notNullable()
    t.string('toX').notNullable()
    t.string('toY').notNullable()
	  t.string('toIndex').notNullable()
    t.integer('nonce').notNullable()
    t.integer('amount').notNullable()
    t.integer('tokenType').notNullable()
    t.string('R1').notNullable()
    t.string('R2').notNullable()
    t.string('S').notNullable()
    t.datetime('timestamp').notNullable()
    t.integer('status').defaultTo(0)
    t.string('txRoot').notNullable()
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('tx')
};
