const express = require("express");
const app = express();

const service_guide = require("./service_guide");
const service_guarantee = require("./service_guarantee");
const service_computer = require("./service_computer");

app.use("/guide", service_guide);
app.use("/guarantee", service_guarantee);
app.use("/computer", service_computer);

module.exports = app;