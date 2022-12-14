const express = require("express");
const server = express();
const apiRouter = require("./api");
const morgan = require("morgan");
require("dotenv").config();
const PORT = 3000;
server.use(morgan("dev"));
const { client } = require("./db");
client.connect();

server.use(express.json());
server.use("/api", apiRouter);

server.listen(PORT, () => {
  console.log("Server is up on port ", PORT);
});
