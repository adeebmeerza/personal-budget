require("dotenv").config();

module.exports = {
  development: {
    username: process.env.PG_DEV_USERNAME,
    password: process.env.PG_DEV_PASSWORD,
    database: process.env.PG_DEV_DATABASE,
    host: process.env.PG_DEV_HOST,
    port: process.env.PG_DEV_PORT,
    dialect: "postgres",
  },
  test: {
    username: process.env.PG_TEST_USERNAME,
    password: process.env.PG_TEST_PASSWORD,
    database: process.env.PG_TEST_DATABASE,
    host: process.env.PG_TEST_HOST,
    port: process.env.PG_TEST_PORT,
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: "postgres",
  },
};
