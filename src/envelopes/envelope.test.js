const request = require("supertest");
const app = require("../app");
const Envelope = require("./envelopes.model");
const sequelize = require("../db");

describe("Envelope", () => {
  afterAll(async () => {
    await sequelize.close();
  });

  describe("Create a new envelope", () => {
    afterAll(async () => {
      await Envelope.destroy({ truncate: true });
    });

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
    afterAll(async () => {
      await Envelope.destroy({ truncate: true });
    });

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

  describe("Get An Envelope", () => {
    afterAll(async () => {
      await Envelope.destroy({ truncate: true });
    });

    const payload = { title: "Grocery", budget: 200.0 };

    let envelope;
    beforeAll(async () => {
      envelope = await Envelope.create(payload);
    });

    it("returns a specific envelope by id", async () => {
      const expected = { statusCode: 200, payload };

      const response = await request(app).get(`/envelopes/${envelope.id}`);

      expect(response.status).toBe(expected.statusCode);
      expect(response.body).toMatchObject(expected.payload);
    });

    it("throws error 400 if id input is not a number", async () => {
      const expected = { statusCode: 400 };

      const response = await request(app).get(`/envelopes/abc`);

      expect(response.status).toBe(expected.statusCode);
    });

    it("throws error 404 if not found", async () => {
      await Envelope.truncate();
      const expected = { statusCode: 404 };

      const response = await request(app).get(`/envelopes/${envelope.id}`);

      expect(response.status).toBe(expected.statusCode);
    });
  });

  describe("Update an envelope", () => {
    afterAll(async () => {
      await Envelope.destroy({ truncate: true });
    });

    const payload = { title: "Bills", budget: 50.0 };
    const updatePayload = { budget: 150 };

    let envelope;
    beforeAll(async () => {
      envelope = await Envelope.create(payload);
    });

    it("update the details of the specific envelope and returns the new details", async () => {
      const expected = { statusCode: 200, payload };

      const response = await request(app)
        .patch(`/envelopes/${envelope.id}`)
        .send(updatePayload);

      expect(response.status).toBe(expected.statusCode);
    });

    it("throws error 400 if id input is not a number", async () => {
      const expected = { statusCode: 400 };

      const response = await request(app)
        .patch("/envelopes/abc")
        .send(updatePayload);

      expect(response.status).toBe(expected.statusCode);
    });

    it("throws error 400 if title is empty", async () => {
      const updatePayload = { title: "" };

      const expected = {
        statusCode: 400,
        errors: ["Title must be a non-empty string."],
      };

      console.log("envelope: ", envelope);
      console.log("envelope.id: ", envelope.id);
      const response = await request(app)
        .patch(`/envelopes/${envelope.id}`)
        .send(updatePayload);

      expect(response.status).toBe(expected.statusCode);
    });

    it("throws error 400 if title is not a string value", async () => {
      const updatePayload = { title: 12312 };

      const expected = {
        statusCode: 400,
        errors: ["Title must be a non-empty string."],
      };

      const response = await request(app)
        .patch(`/envelopes/${envelope.id}`)
        .send(updatePayload);

      expect(response.status).toBe(expected.statusCode);
    });

    it("throws error 400 if budget is not a number", async () => {
      const updatePayload = { budget: "not a number" };

      const expected = {
        statusCode: 400,
        errors: ["Budget must be a number."],
      };

      console.log(envelope.id);
      const response = await request(app)
        .patch(`/envelopes/${envelope.id}`)
        .send(updatePayload);

      expect(response.status).toBe(expected.statusCode);
    });

    it("throws error 404 if the envelope with id not found", async () => {
      await Envelope.truncate();
      const expected = { statusCode: 404 };

      const response = await request(app)
        .patch(`/envelopes/999`)
        .send(updatePayload);

      expect(response.status).toBe(expected.statusCode);
    });
  });
});
