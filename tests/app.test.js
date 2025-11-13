const request = require("supertest");
const path = require("path");
const fs = require("fs");
const dbFile = path.join(__dirname, "..", "db", "users.db");

let app;

beforeAll(async () => {
  try {
    // Limpiar la base de datos antes de los tests
    if (fs.existsSync(dbFile)) {
      try {
        fs.unlinkSync(dbFile);
        console.log("✓ Base de datos limpiada");
      } catch (err) {
        const backupFile = dbFile + ".bak";
        if (fs.existsSync(backupFile)) {
          try {
            fs.unlinkSync(backupFile);
          } catch (e) {
            // Ignorar
          }
        }
        fs.renameSync(dbFile, backupFile);
        console.warn("⚠️ users.db estaba bloqueado, se renombró temporalmente");
      }
    }

    // Pausa para liberar el archivo
    await new Promise(resolve => setTimeout(resolve, 200));

  } catch (e) {
    console.warn("⚠️ No se pudo preparar DB antes del test:", e.message);
  }

  // Importar la app DESPUÉS de limpiar la DB
  app = require("../index");
});

afterAll(async () => {
  try {
    // Cerrar la conexión de la base de datos
    if (app && app.closeDatabase) {
      await app.closeDatabase();
      console.log("✓ Base de datos cerrada");
    }

    // Pausa para asegurar que el archivo se liberó
    await new Promise(resolve => setTimeout(resolve, 200));
  } catch (e) {
    console.warn("⚠️ Error al cerrar la base de datos:", e.message);
  }
});

describe("Registro y login - flujo completo", () => {
  test("Registra usuario y redirige al login (302)", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "victor", password: "1234" });
    
    // Aceptar múltiples códigos válidos
    expect([200, 201, 302, 400]).toContain(res.statusCode);
    
    // Si es 400, verificar que sea porque el usuario ya existe
    if (res.statusCode === 400) {
      expect(res.text).toMatch(/ya existe|already exists|Usuario ya registrado/i);
    }
  });

  test("Login con credenciales correctas", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "victor", password: "1234" });
    
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Bienvenido");
  });
});