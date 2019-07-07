module.exports = {
  up: knex =>
    knex.schema.createTable("deposit", table => {
      table.string("txHash").notNullable().unique().primary();
      table.string("pubkeyX").notNullable();
      table.string("pubkeyY").notNullable();
      table.integer("amount").notNullable();
      table.integer("tokenType").notNullable();
      table.string("depositHash").notNullable();
    }),
  down: knex => knex.schema.dropTable("deposit")
};

 