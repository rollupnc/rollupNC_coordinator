module.exports = {
  up: knex =>
    knex.schema.createTable("account_tree", table => {
      table.string("depth").notNullable();
      table.string("index").notNullable();
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
