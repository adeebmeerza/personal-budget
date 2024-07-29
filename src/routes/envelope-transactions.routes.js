const express = require("express");
const envelopeTransactionsRouter = express.Router();
const { where } = require("sequelize");
const EnvelopeTransaction = require("../db/models/envelope-transactions.model");
const createError = require("http-errors");

envelopeTransactionsRouter.get("/", async (req, res, next) => {
  const filter = {
    fromId: req.body.fromEnvelopeId,
    toId: req.body.toEnvelopeId,
    createdAt: req.body.transactionDate,
  };
  try {
    const envelopeTransactions = await EnvelopeTransaction.findAll({
      where: filter,
    });
    res.send(envelopeTransactions);
  } catch (error) {
    next(createError(error));
  }
});

module.exports = envelopeTransactionsRouter;
