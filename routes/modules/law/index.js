const express = require("express");
const app = express();

const law_safe = require("./law_safe");

app.use("/safe", law_safe);

module.exports = app;