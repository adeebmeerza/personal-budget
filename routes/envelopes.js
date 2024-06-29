const express = require("express");
const envelopesRouter = express.Router();
const createError = require("http-errors");

const envelopesData = [];
let lastEnvelopeId = 1;

const validateData = (req, res, next) => {
  console.log("body", req.body);
  const payload = req.body;
  if (
    payload.title === null ||
    payload.amount === null ||
    typeof payload.title !== "string" ||
    typeof payload.amount !== "number"
  )
    next(createError(400));

  req.body = {
    title: payload.title,
    amount: payload.amount,
  };

  next();
};

envelopesRouter.post("/", validateData, (req, res, next) => {
  const id = lastEnvelopeId;
  lastEnvelopeId++;

  const newEnvelope = {
    id: id,
    ...req.body,
  };

  envelopesData.push(newEnvelope);
  res.send(newEnvelope);
});

module.exports = envelopesRouter;
