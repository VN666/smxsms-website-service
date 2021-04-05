const express = require("express");
const app = express();

const establish_meeting = require("./establish_meeting");
const establish_classroom = require("./establish_classroom");
const establish_volunteer = require("./establish_volunteer");
const establish_two = require("./establish_two");
const establish_practice = require("./establish_practice");
const establish_voice = require("./establish_voice");

app.use("/meeting", establish_meeting);
app.use("/classroom", establish_classroom);
app.use("/volunteer", establish_volunteer);
app.use("/two", establish_two);
app.use("/practice", establish_practice);
app.use("/voice", establish_voice);

module.exports = app;