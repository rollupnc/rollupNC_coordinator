module.exports = {
  up: knex =>
    knex.schema.createTable("deposits", table => {
      table.increments().primary();
      table.integer("block_number").notNullable();
      table.integer("amount").notNullable();
      table.integer("token_type").notNullable();
      table
        .string("transaction_hash")
        .notNullable()
        .unique();
      table.string("x_coordinate").notNullable();
      table.string("y_coordinate").notNullable();
    }),
  down: knex => knex.schema.dropTable("deposits")
};

