module.exports = {
  up: knex =>
    knex.schema.createTable("account_tree", table => {
      table.integer("depth").notNullable();
      table.integer("index").notNullable();
      table.unique(["depth", "index"])
      table.string("hash").notNullable();
      table
        .datetime("createdAt")
        .notNullable()
        .defaultTo(knex.fn.now());
      table
        .datetime("modifiedAt")
        .notNullable()
        .defaultTo(knex.fn.now());
    }),
  down: knex => knex.schema.dropTable("account_tree")
};
