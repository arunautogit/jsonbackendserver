const jsonServer = require("json-server");
const auth = require("json-server-auth");
const cors = require("cors");
const express = require("express");

const app = jsonServer.create();
const router = jsonServer.router("db.json");

// Enable CORS
app.use(cors());

// Body parsing
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

// Load authentication rules
const rules = auth.rewriter({
  users: 600,
  products: 444,
  cart: 600,
  orders: 600,
  payments: 600,
  reviews: 400
});

// Set DB
app.db = router.db;

// Apply rules BEFORE auth
app.use(rules);

// Auth middleware
app.use(auth);

// API route handler
app.use("/api", router);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ JSON Server running at http://localhost:${PORT}`);
});
