const express = require("express");
const app = express();

const party_theory = require("./party_theory");
const party_construct = require("./party_construct");
const party_life = require("./party_life");
const party_institution = require("./party_institution");
const party_book = require("./party_book");
const party_project = require("./party_project");
const party_position = require("./party_position");

app.use("/theory", party_theory);
app.use("/construct", party_construct);
app.use("/life", party_life);
app.use("/institution", party_institution);
app.use("/book", party_book);
app.use("/project", party_project);
app.use("/position", party_position);

module.exports = app;