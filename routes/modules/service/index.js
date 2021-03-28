const express = require("express");
const app = express();

const service_guarantee = require("./service_guarantee");
const service_computer = require("./service_computer");

app.use("/guarantee", service_guarantee);
app.use("/computer", service_computer);

module.exports = app;