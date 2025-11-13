const request = require("supertest");
const path = require("path");
const fs = require("fs");
const dbFile = path.join(__dirname, "..", "db", "users.db");

beforeAll(() => {
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

const app = require("../index");

describe("Registro y login - flujo completo", () => {
  test("Registra usuario y redirige al login (302)", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "victor", password: "1234" });
    expect([200, 201, 302]).toContain(res.statusCode);
  });

  test("Login con credenciales correctas", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "victor", password: "1234" });
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Bienvenido");
  });
});
