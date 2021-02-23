const express = require("express");
const app = express();

const school_display = require("./school_display");

app.use("/display", school_display);

module.exports = app;