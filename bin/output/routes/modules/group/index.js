const express = require("express");
const app = express();

const group_party = require("./group_party");
const group_ccyl = require("./group_ccyl");
const group_union = require("./group_union");
const group_excellent = require("./group_excellent");

app.use("/party", group_party);
app.use("/ccyl", group_ccyl);
app.use("/union", group_union);
app.use("/excellent", group_excellent);

module.exports = app;