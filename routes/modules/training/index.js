const express = require("express");
const app = express();

const training_study = require("./training_study");

app.use("/study", training_study);

module.exports = app;