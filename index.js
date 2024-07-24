const app = require("./src/app");
const sequelize = require("./src/db");
const db = require("./src/db");

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    await db.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );

    const server = app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });

    // Handle process termination signals
    process.on("SIGTERM", () => {
      shutdown(server);
    });

    process.on("SIGINT", () => {
      shutdown(server);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

const shutdown = (server) => {
  console.log("Received kill signal, shutting down gracefully.");
  server.close(async () => {
    await sequelize.close();
    console.log("Database disconnected.");
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

bootstrap();
