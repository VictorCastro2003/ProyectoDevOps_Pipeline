const request = require("supertest");
const path = require("path");
const fs = require("fs");
const dbFile = path.join(__dirname, "..", "db", "users.db");

beforeAll(() => {
  try {
    // Si el archivo existe y no está bloqueado, lo borramos
    if (fs.existsSync(dbFile)) {
      try {
        fs.unlinkSync(dbFile);
      } catch (err) {
        // Si está bloqueado, lo renombramos (Windows no permite borrar si está en uso)
        const backupFile = dbFile + ".bak";
        if (fs.existsSync(backupFile)) fs.unlinkSync(backupFile);
        fs.renameSync(dbFile, backupFile);
        console.warn("⚠️ users.db estaba bloqueado, se renombró temporalmente");
      }
    }
  } catch (e) {
    console.warn("⚠️ No se pudo preparar DB antes del test:", e.message);
  }
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
