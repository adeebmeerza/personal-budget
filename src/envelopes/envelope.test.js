const request = require("supertest");
const app = require("../app");
const Envelope = require("./envelopes.model");
const sequelize = require("../db");

describe("Envelope", () => {
  afterEach(async () => {
    await Envelope.destroy({ truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("Create a new envelope", () => {
    const payload = { title: "Grocery", budget: 200.0 };

    it("returns the stored envelope details", async () => {
      const expected = { statusCode: 200, payload };

      const response = await request(app).post("/envelopes").send(payload);

      expect(response.status).toBe(expected.statusCode);
      expect(response.body.title).toMatch(expected.payload.title);
      expect(response.body.budget).toEqual(expected.payload.budget);
    });

    it("returns input validation error when title input is null", async () => {
      const modifiedPayload = { ...payload, title: null };
      const expected = { statusCode: 400, modifiedPayload };

      const response = await request(app)
        .post("/envelopes")
        .send(modifiedPayload);

      expect(response.status).toEqual(expected.statusCode);
    });

    it("returns input validation error when title input is empty string", async () => {
      const modifiedPayload = { ...payload, title: "" };
      const expected = { statusCode: 400, modifiedPayload };

      const response = await request(app)
        .post("/envelopes")
        .send(modifiedPayload);

      expect(response.status).toBe(expected.statusCode);
    });

    it("returns input validation error when budget input is null", async () => {
      const modifiedPayload = { ...payload, budget: null };
      const expected = { statusCode: 400, payload };

      const response = await request(app)
        .post("/envelopes")
        .send(modifiedPayload);

      expect(response.status).toBe(expected.statusCode);
    });

    it("returns input validation error when budget input other than number", async () => {
      const modifiedPayload = { ...payload, budget: "123" };
      const expected = { statusCode: 400, payload };

      const response = await request(app)
        .post("/envelopes")
        .send(modifiedPayload);

      expect(response.status).toBe(expected.statusCode);
    });
  });

  describe("List envelopes", () => {
    const payloads = [
      { title: "Grocery", budget: 200.0 },
      { title: "Food", budget: 900 },
    ];

    it("returns all envelopes", async () => {
      await Envelope.bulkCreate(payloads);
      const expected = { statusCode: 200, payloads };

      const response = await request(app).get("/envelopes");
      // console.log("actual", response);

      expect(response.status).toBe(expected.statusCode);
      expect(response.body).toMatchObject(expected.payloads);
    });

    it("returns empty array if no data found", async () => {
      await Envelope.destroy({ truncate: true });
      const expected = { statusCode: 200, payloads };

      const response = await request(app).get("/envelopes");
      expect(response.status).toBe(expected.statusCode);
      expect(response.body).toStrictEqual([]);
    });
  });
});
