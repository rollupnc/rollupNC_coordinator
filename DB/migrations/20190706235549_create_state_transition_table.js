exports.up = function(knex, Promise) {
  return knex.schema.createTable("state_transitions", function(t) {
    t.string("txRoot")
      .primary()
      .unique()
      .notNullable();
    t.string("toIndexes").notNullable();
    t.string("txHashes").notNullable();
    t.json("proof").notNullable();
    t.datetime("createdAt")
      .notNullable()
      .defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("state_transitions");
};
