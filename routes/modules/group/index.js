const express = require("express");
const app = express();

const group_ccyl = require("./group_ccyl");

app.use("/ccyl", group_ccyl);

module.exports = app;