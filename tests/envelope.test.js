const request = require("supertest");
const assert = require("assert");
const app = require("../app");

describe("Envelope", () => {
  before(() => {});

  describe("Create a new envelope", () => {
    const payload = { title: "Grocery", budget: 200.0 };

    it("returns the stored envelope details", async () => {
      const expected = { statusCode: 200, payload };

      const response = await request(app).post("/envelopes").send(payload);

      assert.equal(response.status, expected.statusCode);
      assert.equal(response.body.title, expected.payload.title);
      assert.equal(response.body.budget, expected.payload.budget);
    });

    it("returns input validation error when title input is null", async () => {
      const modifiedPayload = { ...payload, title: null };
      const response = await request(app)
        .post("/envelopes")
        .send(modifiedPayload);
      const expected = { statusCode: 400, modifiedPayload };

      assert.equal(response.status, expected.statusCode);
    });

    it("returns input validation error when title input is empty string", async () => {
      const modifiedPayload = { ...payload, title: "" };
      const response = await request(app)
        .post("/envelopes")
        .send(modifiedPayload);
      const expected = { statusCode: 400, modifiedPayload };

      assert.equal(response.status, expected.statusCode);
    });

    it("returns input validation error when budget input is null", async () => {
      const modifiedPayload = { ...payload, budget: null };
      const response = await request(app)
        .post("/envelopes")
        .send(modifiedPayload);
      const expected = { statusCode: 400, payload };

      assert.equal(response.status, expected.statusCode);
    });

    it("returns input validation error when budget input other than number", async () => {
      const modifiedPayload = { ...payload, budget: "123" };
      const response = await request(app)
        .post("/envelopes")
        .send(modifiedPayload);
      const expected = { statusCode: 400, payload };

      assert.equal(response.status, expected.statusCode);
    });
  });
});
