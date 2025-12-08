const jsonServer = require("json-server");
const auth = require("json-server-auth");
const cors = require("cors");
const express = require("express");
const routes = require("./routes.json");

const app = jsonServer.create();
const router = jsonServer.router("db.json");

// Middleware
app.use(cors());
app.use(express.json());
app.use(jsonServer.bodyParser);

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body || "No Body");
  console.log("-----------------------------------");
  next();
});

// DB
app.db = router.db;

// AUTH RULES
const rules = auth.rewriter({
  users: 600,
  products: 444,
  cart: 600,
  orders: 600,
  payments: 600,
  reviews: 600,
  login: 222,
  register: 222
});

// Apply auth rules
app.use(rules);
app.use(auth);

// ✅ APPLY ROUTE REWRITE CORRECTLY
app.use(jsonServer.rewriter(routes));
app.use(router);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ JSON Server running at http://localhost:${PORT}`);
});
