const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const createError = require("http-errors");

const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/healthcheck", (req, res, next) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).send();
  }
});

const envelopesRouter = require("./routes/envelopes.routes");
app.use("/envelopes", envelopesRouter);

const envelopeTransactionRouter = require("./routes/envelope-transactions.routes");
app.use("/envelope-transactions", envelopeTransactionRouter);

app.use((req, res, next) => {
  next(createError(404, "Route not found"));
}); // route not found

// global error handler
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.sendStatus(400); // Bad request
  }

  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
