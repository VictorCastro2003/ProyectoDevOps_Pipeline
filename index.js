const express = require("express");
const path = require("path");
const app = express();
const authRoutes = require("./routes/auth");
const db = require("./db/database"); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/auth", authRoutes);

app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "login.html"))
);
app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "register.html"))
);

// Función para cerrar la conexión de la base de datos
app.closeDatabase = () => {
  if (db && db.close) {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  return Promise.resolve();
};

if (require.main === module) {
  app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
}

module.exports = app;