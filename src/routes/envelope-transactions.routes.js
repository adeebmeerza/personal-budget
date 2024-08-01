const express = require("express");
const envelopeTransactionsRouter = express.Router();

const { Op } = require("sequelize");
const { EnvelopeTransaction } = require("../db/models");
const createError = require("http-errors");
const { isValidNumericId, isValidDateRange } = require("../utils/validators");

const validateQueryParams = (req, res, next) => {
  const query = req.query;
  try {
    if (query["toEnvelopeId"] && !isValidNumericId(query["toEnvelopeId"])) {
      return next(createError(400, "Invalid toEnvelopeId input"));
    }

    if (
      (query.startDate || query.endDate) &&
      !isValidDateRange(query.startDate, query.endDate)
    ) {
      return next(
        createError(
          400,
          "Invalid startDate / endDate input. Both are required if either one is specified."
        )
      );
    }

    next();
  } catch (error) {
    next(createError(400, error));
  }
};

envelopeTransactionsRouter.get(
  "/",
  validateQueryParams,
  async (req, res, next) => {
    // query transactions which involved by an envelope
    // by default filter to today's date
    // if no filter specified, returns all logs that envelope id param in path as source & destination envelope
    // if filter by source id, returns only logs that an envelope is a source envelope
    // if filter by destination id, returns logs that an envelope of path param id is a source envelope and destionation id is a destination envelope

    const query = req.query;
    const keys = ["fromEnvelopeId", "toEnvelopeId", "startDate", "endDate"];

    let fromId = req.envelope.id;
    // let toId = req.envelope.id;

    const formattedFilter = {};

    formattedFilter["fromId"] = fromId;

    if (query["toEnvelopeId"]) {
      formattedFilter["toId"] = Number(query["toEnvelopeId"]);
    }

    if (!query.startDate && !query.endDate) {
      formattedFilter["createdAt"] = {
        [Op.lte]: new Date(new Date().setUTCHours(23, 59, 59, 999)),
        [Op.gte]: new Date(new Date().setUTCHours(0, 0, 0, 999)),
      };
    } else {
      formattedFilter["createdAt"] = {
        [Op.lte]: new Date(
          new Date(query.endDate).setUTCHours(23, 59, 59, 999)
        ),
        [Op.gte]: new Date(new Date(query.startDate).setUTCHours(0, 0, 0, 0)),
      };
    }

    try {
      const envelopeTransactions = await EnvelopeTransaction.findAll({
        where: formattedFilter,
      });
      res.json(envelopeTransactions);
    } catch (error) {
      next(createError(error));
    }
  }
);

module.exports = envelopeTransactionsRouter;
