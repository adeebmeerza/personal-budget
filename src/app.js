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

const envelopesRouter = require("./envelopes/envelopes.routes");

app.use("/envelopes", envelopesRouter); // envelope route
app.use((req, res, next) => {
  next(createError(404, "Route not found"));
}); // route not found

// global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
