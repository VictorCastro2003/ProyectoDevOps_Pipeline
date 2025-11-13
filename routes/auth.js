const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/database");
const router = express.Router();

router.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Datos incompletos");

  const hashed = bcrypt.hashSync(password, 8);
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

  db.run(sql, [username, hashed], function (err) {
    if (err) return res.status(400).send("Usuario ya existe o error.");
    res.redirect("/login");
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  db.get(sql, [username], (err, user) => {
    if (err) return res.status(500).send("Error en BD");
    if (!user) return res.status(404).send("Usuario no encontrado");
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).send("Contraseña incorrecta");
    res.status(200).send(`<h2>Bienvenido, ${user.username}</h2>`);
  });
});

module.exports = router;
