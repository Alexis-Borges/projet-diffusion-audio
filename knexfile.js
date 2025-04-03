/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  default: {
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "projet_pharma",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "admin",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations",
    },
  },
};
