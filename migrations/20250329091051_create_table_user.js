/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("user", function (table) {
      table.increments("id").primary();
      table.string("email").notNullable().unique();
      table.string("password").notNullable();
    })
    .then(() => {
      return knex("user").insert([
        { email: "jass@gmail.com", password: "12345678" },
        { email: "test@gmail.com", password: "testing" },
        { email: "manioc@gmail.com", password: "manioc" },
      ]);
    })
    .then(() => {
      return knex.schema.createTable("playlist", function (table) {
        table.increments("id").primary();
        table
          .integer("user_id")
          .notNullable()
          .references("id")
          .inTable("user")
          .onDelete("CASCADE");
        table.string("name").notNullable();
        table.json("tracks").notNullable();
        table.timestamps(true, true);
      });
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("playlist").then(() => {
    return knex.schema.dropTableIfExists("user");
  });
};
