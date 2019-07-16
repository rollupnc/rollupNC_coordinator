module.exports = {
  up: knex =>
    knex.schema.createTable("deposits", table => {
      table.string("txHash").notNullable().unique().primary();
      table.integer("blockNumber").notNullable();
      table.string("pubkeyX").notNullable();
      table.string("pubkeyY").notNullable();
      table.integer("amount").notNullable();
      table.integer("tokenType").notNullable();
      table.string("depositHash");
    }),
  down: knex => knex.schema.dropTable("deposits")
};
