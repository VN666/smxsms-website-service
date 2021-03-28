const express = require("express");
const app = express();

const education_research = require("./education_research");

app.use("/research", education_research);

module.exports = app;