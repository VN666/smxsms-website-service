const express = require("express");
const app = express();

const union_staff = require("./union_staff");

app.use("/staff", union_staff);

module.exports = app;