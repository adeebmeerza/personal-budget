const app = require("../src/app");
const {
  Envelope,
  EnvelopeTransaction,
  sequelize,
} = require("../src/db/models");
const request = require("supertest");

describe("Envelope Transactions", () => {
  let envelopes,
    transactionLogs = [];

  // Helper function to format transaction logs
  const formatTransactionLogs = (log) => {
    const { dataValues } = log;
    const formattedDataValues = { ...dataValues };

    formattedDataValues.createdAt = formattedDataValues.createdAt.toISOString();
    formattedDataValues.updatedAt = formattedDataValues.updatedAt.toISOString();

    return formattedDataValues;
  };

  // Helper function to create envelope transactions
  const createTransaction = async (from, to, amount) => {
    const transaction = await EnvelopeTransaction.create({
      fromId: from.id,
      toId: to.id,
      transferredAmount: amount,
    });
    transactionLogs.push(transaction);
    return transaction;
  };

  beforeAll(async () => {
    try {
      await sequelize.authenticate();
    } catch (error) {
      console.error("Error unable to connect to the database:", error);
    }

    try {
      // Create envelopes
      const envelopeData = [
        { title: "Grocery", budget: 100.0 },
        { title: "Books", budget: 100.0 },
        { title: "Entertainment", budget: 100.0 },
        { title: "Food", budget: 100.0 },
      ];
      envelopes = await Envelope.bulkCreate(envelopeData);

      // Create transactions
      const transactionData = [
        { from: envelopes[0], to: envelopes[1], amount: 50 },
        { from: envelopes[2], to: envelopes[1], amount: 50 },
        { from: envelopes[3], to: envelopes[0], amount: 50 },
        { from: envelopes[0], to: envelopes[2], amount: 50 },
      ];

      transactionLogs = await Promise.all(
        transactionData.map(async ({ from, to, amount }) => {
          const transaction = await createTransaction(from, to, amount);
          return transaction;
        })
      );
    } catch (error) {
      console.error("Error setting up test data:", error);
    }
  });

  afterAll(async () => {
    try {
      await EnvelopeTransaction.destroy({ truncate: { cascade: true } });
    } catch (error) {
      console.error("Error cleaning up test data:", error);
    }

    try {
      await sequelize.close();
    } catch (error) {
      console.error("Error disconnect sequelize:", error);
    }
  });

  describe("List all transactions", () => {
    it("returns all transactions involving a specific envelope, default to today", async () => {
      const expected = {
        status: 200,
        transactions: {
          firstEnvelope1AsSource: formatTransactionLogs(transactionLogs[0]),
          secEnvelope1AsSource: formatTransactionLogs(transactionLogs[3]),
        },
      };

      const envelopeId = envelopes[0].id;
      const response = await request(app).get(
        `/envelopes/${envelopeId}/transactions`
      );

      expect(response.status).toBe(expected.status);
      expect(response.body.length).toEqual(2);
      expect(response.body[0]).toMatchObject(
        expected.transactions.firstEnvelope1AsSource
      );
      expect(response.body[1]).toMatchObject(
        expected.transactions.secEnvelope1AsSource
      );
    });

    it("returns transactions filtered by destination envelope", async () => {
      const expected = {
        status: 200,
        transaction: {
          envelope1AsDest: formatTransactionLogs(transactionLogs[3]),
        },
      };

      const envelopeId = envelopes[0].id;
      const filterQuery = { toEnvelopeId: envelopes[2].id };

      const response = await request(app)
        .get(`/envelopes/${envelopeId}/transactions`)
        .query(filterQuery);

      expect(response.status).toBe(expected.status);
      expect(response.body.length).toEqual(1);
      expect(response.body[0]).toMatchObject(
        expected.transaction.envelope1AsDest
      );
    });

    it("returns transactions filtered by date", async () => {
      const yesterday = new Date(
        new Date().setUTCDate(new Date().getUTCDate() - 1)
      );

      transactionLogs[0].changed("createdAt", true);
      transactionLogs[0].set("createdAt", yesterday, { raw: true });
      await transactionLogs[0].save({ silent: true, fields: ["createdAt"] });

      const filterQuery = { startDate: yesterday, endDate: yesterday };

      const expected = {
        status: 200,
        transaction: {
          envelopeThatMatchYesterdayDateFilter: formatTransactionLogs(
            transactionLogs[0]
          ),
        },
      };

      const envelopeId = envelopes[0].id;

      const response = await request(app)
        .get(`/envelopes/${envelopeId}/transactions`)
        .query(filterQuery);

      expect(response.status).toBe(expected.status);
      expect(response.body.length).toEqual(1);
      expect(response.body).toMatchObject([
        expected.transaction.envelopeThatMatchYesterdayDateFilter,
      ]);
    });

    it("returns 404 if no filter conditions are met", async () => {
      const tomorrow = new Date(
        new Date().setUTCDate(new Date().getUTCDate() + 1)
      ).toISOString();
      const filterQuery = { startDate: tomorrow, endDate: tomorrow };

      const expected = { status: 200 };

      const envelopeId = envelopes[0].id;

      const response = await request(app)
        .get(`/envelopes/${envelopeId}/transactions`)
        .query(filterQuery);

      expect(response.status).toBe(expected.status);
      expect(response.body.length).toEqual(0);
      expect(response.body).toMatchObject([]);
    });

    it("returns 400 if envelope id is not a number", async () => {
      const expected = { status: 400 };
      const envelopeId = "id";

      const response = await request(app).get(
        `/envelopes/${envelopeId}/transactions`
      );

      expect(response.status).toBe(expected.status);
    });

    it("returns 400 if transaction date filter is not a date", async () => {
      const expected = { status: 400 };
      const filterQuery = { startDate: "date", endDate: "date" };
      const envelopeId = envelopes[0].id;

      const response = await request(app)
        .get(`/envelopes/${envelopeId}/transactions`)
        .query(filterQuery);

      expect(response.status).toBe(expected.status);
    });
  });
});
