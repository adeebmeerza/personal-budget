const server = require("./src/app");
const db = require("./src/db/sequelize");

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    await db.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );

    const instance = server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });

    // Handle process termination signals
    process.on("SIGTERM", () => {
      shutdown(instance);
    });

    process.on("SIGINT", () => {
      shutdown(instance);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

const shutdown = (instance) => {
  console.log("\n\nReceived kill signal, shutting down gracefully.");
  instance.close(async () => {
    await instance.close();
    console.log("Database disconnected.");
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

bootstrap();
