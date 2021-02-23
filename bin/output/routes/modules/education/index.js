const express = require("express");
const app = express();

const education_research = require("./education_research");
const education_case = require("./education_case");
const education_summary = require("./education_summary");
const education_ppt = require("./education_ppt");
const education_paper = require("./education_paper");
const education_feature = require("./education_feature");

app.use("/research", education_research);
app.use("/case", education_case);
app.use("/summary", education_summary);
app.use("/ppt", education_ppt);
app.use("/paper", education_paper);
app.use("/feature", education_feature);

module.exports = app;