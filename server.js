const jsonServer = require("json-server");
const auth = require("json-server-auth");
const cors = require("cors");

const app = jsonServer.create();
const router = jsonServer.router("db.json");

// Bind the router db to the app
app.db = router.db;

// Enable CORS
app.use(cors());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Use json-server-auth rules
const rules = auth.rewriter({
  users: 660,
  products: 664,
  cart: 660,
  orders: 660,
  payments: 660,
  reviews: 660
});
app.use(rules);
app.use(auth);
app.use(router);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`JSON Server running at port ${PORT}`);
});
