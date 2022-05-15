const { PORT } = require("./src/config");

const app = require('./app');

// Listen to server port
app.listen(PORT, async () => {
    // Initialize MongoDB
    await require("./src/config/mongo-db.config")()
    console.log(`✅ :: Ping master, your server is listening on port ${PORT}`);
});
  
// On  server error
app.on("error", (error) => {
    console.error(`🚫 :: An error occurred on the server: \n ${error}`);
});