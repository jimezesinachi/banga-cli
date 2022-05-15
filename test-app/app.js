require("express-async-errors");
const app = require("express")();

// Pre-route middlewares
require("./src/middlewares/pre-route.middleware")(app);

// API routes
app.use("/api", require("./src/routes"));

// Ping route for testing connection
app.get("/ping", (req, res) => res.status(200).send("Hello world! 😁"));

// Error middlewares
require("./src/middlewares/error.middleware")(app);

module.exports = app;