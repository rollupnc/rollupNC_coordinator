exports.up = function(knex, Promise) {
  return knex.schema.createTable("accounts", function(t) {
    t.integer("index")
      .primary()
      .unique();
    t.string("pubkeyX").notNullable();
    t.string("pubkeyY").notNullable();
    t.integer("balance").notNullable();
    t.integer("nonce").defaultTo(0);
    t.integer("tokenType").notNullable();
    t.string("modifiedBy");
    t.datetime("createdAt")
      .defaultTo(knex.fn.now())
      .notNullable();
    t.datetime("updatedAt")
      .defaultTo(knex.fn.now())
      .notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("accounts");
};
