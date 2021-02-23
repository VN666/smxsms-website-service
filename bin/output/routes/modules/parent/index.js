const express = require("express");
const app = express();

const parent_pratice = require("./parent_pratice");
const parent_knowledge = require("./parent_knowledge");
const parent_communication = require("./parent_communication");

app.use("/pratice", parent_pratice);
app.use("/knowledge", parent_knowledge);
app.use("/communication", parent_communication);

module.exports = app;