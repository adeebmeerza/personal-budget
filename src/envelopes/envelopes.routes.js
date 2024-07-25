const express = require("express");
const envelopesRouter = express.Router();
const createError = require("http-errors");
const Envelope = require("./envelopes.model");
const db = require("../db");

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
  try {
    const numericId = Number(id);
    if (isNaN(numericId))
      return next(createError(400, "Invalid envelope id given"));

    const envelope = await Envelope.findByPk(numericId);

    if (!envelope) {
      return next(createError(404, "Envelope not found"));
    }
    req.envelope = envelope;
    req.id = numericId;

    next();
  } catch (error) {
    next(createError(404, "Envelope not found"));
  }
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

envelopesRouter.delete("/:id", async (req, res, next) => {
  try {
    await Envelope.destroy({ where: { id: req.id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

/** Transfer route */

const transferRouter = express.Router({ mergeParams: true });
envelopesRouter.use("/:id/transfer-budget", transferRouter); // register transfer nested route in envelope route

transferRouter.param("toId", async (req, res, next, toId) => {
  try {
    const numericId = Number(toId);
    if (isNaN(numericId))
      return next(createError(400, "Invalid envelope id given"));

    const envelope = await Envelope.findByPk(numericId);
    console.log(envelope);

    if (!envelope) {
      return next(createError(404, "Envelope not found"));
    }
    req.toEnvelope = envelope;

    next();
  } catch (error) {
    next(createError(404, "To Envelope not found"));
  }
});

const validateTransferAmount = (req, res, next) => {
  const transferAmount = req.body.transferAmount;

  // validate envelopes details
  if (transferAmount === null || isNaN(transferAmount))
    return next(createError(400, "Input must be number"));

  // validate transfer amount to make sure enough to transfer
  if (transferAmount > req.envelope.budget)
    return next(createError(400, "Insufficient amount to transfer"));

  req.transferAmount = transferAmount;

  next();
};

transferRouter.post(
  "/:toId",
  validateTransferAmount,
  async (req, res, next) => {
    try {
      // subtract / add budget amount
      req.envelope.budget = req.envelope.budget - req.transferAmount;
      req.toEnvelope.budget = req.toEnvelope.budget + req.transferAmount;

      const result = await db.transaction(async (t) => {
        const updatedSourceEnvelope = await Envelope.update(
          { budget: req.envelope.budget },
          {
            where: { id: req.envelope.id },
            transaction: t,
          }
        );

        const updatedDestinationEnvelope = await Envelope.update(
          { budget: req.toEnvelope.budget },
          {
            where: { id: req.envelope.id },
            transaction: t,
          }
        );

        return { updatedSourceEnvelope, updatedDestinationEnvelope };
      });

      if (
        result.updatedSourceEnvelope[0] > 0 &&
        result.updatedDestinationEnvelope[0] > 0
      )
        res.json({
          newBalance: {
            from: req.envelope.budget,
            to: req.toEnvelope.budget,
          },
        });
    } catch (error) {
      next(createError(500, `Transaction failed: ${error}`));
    }
  }
);

module.exports = envelopesRouter;
