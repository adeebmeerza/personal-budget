const express = require("express");
const envelopesRouter = express.Router();
const createError = require("http-errors");
const Envelope = require("./envelopes.model");
const { where } = require("sequelize");

const envelopesData = [
  {
    id: 1,
    title: "bills",
    budget: 150,
  },
  {
    id: 2,
    title: "house",
    budget: 1400,
  },
];

let lastEnvelopeId = 1;

const validateData = (req, res, next) => {
  const payload = req.body;
  if (
    payload.title === null ||
    payload.title === "" ||
    payload.budget === null ||
    payload.budget === "" ||
    typeof payload.title !== "string" ||
    typeof payload.budget !== "number"
  )
    next(createError(400));

  req.body = {
    title: payload.title,
    budget: Number(payload.budget),
  };

  next();
};

envelopesRouter.post("/", validateData, async (req, res, next) => {
  const payload = req.body;

  try {
    const newEnvelope = await Envelope.create(payload);

    res.json(newEnvelope);
  } catch (error) {
    next(error);
  }
});

envelopesRouter.get("/", async (req, res, next) => {
  try {
    const envelopes = await Envelope.findAll();
    res.send(envelopes);
  } catch (error) {
    next(error);
  }
});

envelopesRouter.param("id", async (req, res, next, id) => {
  const numericId = Number(id);
  if (isNaN(numericId)) return next(createError(400));
  req.id = numericId;

  try {
    const envelope = await Envelope.findByPk(numericId);

    req.envelope = envelope || next(createError(404, "Envelope not found"));
    next();
  } catch (error) {
    next(createError(404, "Envelope not found"));
  }
});

envelopesRouter.param("fromId", (req, res, next, fromId) => {
  const numericId = Number(fromId);
  if (isNaN(numericId)) return next(createError(404));

  const fromEnvelopeIndex = envelopesData.findIndex(
    (envelope) => envelope.id === numericId
  );

  if (fromEnvelopeIndex === -1)
    return next(createError(404, "From envelope not found"));

  req.fromEnvelopeIndex = fromEnvelopeIndex;
  req.fromEnvelope = envelopesData[fromEnvelopeIndex];

  next();
});

envelopesRouter.get("/:id", (req, res, next) => {
  res.send(req.envelope);
});

const validateUpdateData = (req, res, next) => {
  const payload = req.body;
  const errors = [];

  if (
    payload.title !== undefined &&
    (typeof payload.title !== "string" ||
      (typeof payload.title === "string" && payload.title.trim() === ""))
  ) {
    errors.push("Title must be a non-empty string.");
  }

  if (payload.budget !== undefined && isNaN(payload.budget)) {
    errors.push("Budget must be a number.");
  }

  if (errors.length > 0) {
    return next(createError(400, { errors }));
  } else {
    next();
  }
};

envelopesRouter.patch("/:id", validateUpdateData, async (req, res, next) => {
  const updateEnvelopePayload = { ...req.envelope, ...req.body };
  try {
    const updatedEnvelope = await Envelope.update(updateEnvelopePayload, {
      where: { id: req.envelope.id },
    });
    res.send(updatedEnvelope[1]);
  } catch (error) {
    next(error);
  }
});

envelopesRouter.delete("/:id", (req, res, next) => {
  const deletedEnvelope = envelopesData.splice(req.envelopeIndex, 1);
  if (deletedEnvelope.length === 0)
    return next(createError(500, "Envelope was found but failed to delete"));
  res.sendStatus(204);
});

/** Transfer route */

const transferRouter = express.Router({ mergeParams: true });
envelopesRouter.use("/:fromId/transfer", transferRouter); // register transfer nested route in envelope route

transferRouter.param("toId", (req, res, next, toId) => {
  const numericId = Number(id);
  if (isNaN(numericId)) return next(createError(400));

  const toEnvelopeIndex = envelopesData.findIndex(
    (envelope) => envelope.id === numericId
  );

  if (toEnvelopeIndex === -1)
    return next(createError(404, "To envelope not found"));

  req.toEnvelopeIndex = toEnvelopeIndex;
  req.toEnvelope = envelopesData[toEnvelopeIndex];

  next();
});

transferRouter.post(
  "/:toId",
  (req, res, next) => {
    const transferAmount = req.body.transferAmount;

    // validate envelopes details
    if (transferAmount === null || typeof transferAmount !== "number")
      return next(createError(404, "Input must be number"));

    // validate transfer amount to make sure enough to transfer
    if (transferAmount > req.fromEnvelope.amount)
      return next(createError(400, "Insufficient money to transfer"));

    req.transferAmount = transferAmount;

    next();
  },
  (req, res, next) => {
    // subtract / add budget amount
    envelopesData[req.fromEnvelopeIndex].amount =
      req.fromEnvelope.amount - req.transferAmount;
    envelopesData[req.toEnvelopeIndex].amount =
      req.toEnvelope.amount + req.transferAmount;

    res.json({
      newBalance: {
        from: req.fromEnvelope.amount,
        to: req.toEnvelope.amount,
      },
    });
  }
);

module.exports = envelopesRouter;
