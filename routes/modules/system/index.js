const express = require("express");
const app = express();

const system_department = require("./system_department");
const system_account = require("./system_account");

app.use("/department", system_department);
app.use("/account", system_account);

module.exports = app;