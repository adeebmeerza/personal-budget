const express = require("express");
const envelopesRouter = express.Router();
const createError = require("http-errors");

const envelopesData = [
  {
    id: 1,
    title: "bills",
    amount: 150,
  },
  {
    id: 2,
    title: "house",
    amount: 1400,
  },
];

let lastEnvelopeId = 1;

const validateData = (req, res, next) => {
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
    amount: Number(payload.amount),
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

envelopesRouter.get("/", (req, res, next) => {
  res.send(envelopesData);
});

envelopesRouter.param("id", (req, res, next) => {
  req.params.id = Number(req.params.id);

  if (envelopesData.length === 0) return next(createError(404));

  const envelopeIndex = envelopesData.findIndex(
    (envelope) => envelope.id === req.params.id
  );

  if (envelopeIndex < 0) return next(createError(404));

  req.envelopeIndex = envelopeIndex;
  req.envelope = envelopesData[envelopeIndex];
  next();
});

envelopesRouter.get("/:id", (req, res, next) => {
  res.send(req.envelope);
});

envelopesRouter.put("/:id", validateData, (req, res, next) => {
  const updateEnvelopePayload = { ...req.envelope, ...req.body };
  req.envelope = updateEnvelopePayload;
  res.send(req.envelope);
});

module.exports = envelopesRouter;
