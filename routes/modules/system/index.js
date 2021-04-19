const express = require("express");
const app = express();

const system_department = require("./system_department");
const system_account = require("./system_account");
const system_log = require("./system_log");

app.use("/department", system_department);
app.use("/account", system_account);
app.use("/log", system_log);

module.exports = app;