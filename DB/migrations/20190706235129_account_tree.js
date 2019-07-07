module.exports = {
    up: knex =>
      knex.schema.createTable("account_tree", table => {
        table.string("depth").notNullable()
        table.string("index").notNullable()
        table.string("hash").notNullable()
        table.datetime('createdAt')
        table.datetime('modifiedAt')
      }),
    down: knex => knex.schema.dropTable("account_tree")
  };
  
   