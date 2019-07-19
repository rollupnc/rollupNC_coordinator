exports.up = function(knex, Promise) {
  return knex.schema.createTable("tx", function(t) {
    t.string("hash")
      .notNullable()
      .primary()
      .unique();
    t.string("fromX").notNullable();
    t.string("fromY").notNullable();
    t.integer("fromIndex").notNullable();
    t.string("toX").notNullable();
    t.string("toY").notNullable();
    t.string("toIndex").notNullable();
    t.integer("nonce").notNullable();
    t.integer("amount").notNullable();
    t.integer("tokenType").notNullable();
    t.string("R8x").notNullable();
    t.string("R8y").notNullable();
    t.string("S").notNullable();
    t.datetime("timestamp")
      .notNullable()
      .defaultTo(knex.fn.now());
    // status definitions to later be included in a table like token type
    // 0: processing
    // 1: awaiting transfer inclusion in proof,
    // 2: transfer included in proof,
    // 3: awaiting withdraw inclusion in proof,
    // TODO remove usage of 3
    // 4: withdraw included in proof,
    // 5: withdrawn on smart contract
    t.integer("status")
      .notNullable()
      .defaultTo(0);
    t.string("txRoot");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("tx");
};
