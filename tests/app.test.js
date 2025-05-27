const request = require("supertest");
const app = require("../src/app");

describe("Health Check Endpoint", () => {
  it("should return health status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toHaveProperty("status", "OK");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("environment");
  });
});

describe("API Root Endpoint", () => {
  it("should return API information", async () => {
    const response = await request(app).get("/api").expect(200);

    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("version");
    expect(response.body).toHaveProperty("endpoints");
  });
});

describe("404 Handler", () => {
  it("should return 404 for non-existent routes", async () => {
    const response = await request(app).get("/non-existent-route").expect(404);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toHaveProperty("message");
    expect(response.body.error.message).toContain("Not Found");
  });
});
