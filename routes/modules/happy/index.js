const express = require("express");
const app = express();

const happy_idea = require("./happy_idea");
const happy_speech = require("./happy_speech");
const happy_exercise = require("./happy_exercise");

app.use("/idea", happy_idea);
app.use("/speech", happy_speech);
app.use("/exercise", happy_exercise);

module.exports = app;