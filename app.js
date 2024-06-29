const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const createError = require("http-errors");

const PORT = process.env.port || 3000;

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

const envelopesRouter = require("./routes/envelopes");
app.use("/envelopes", envelopesRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  if (err.status >= 500) console.log(err);
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
