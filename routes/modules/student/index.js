const express = require("express");
const app = express();

const student_activity = require("./student_activity");
const student_prize = require("./student_prize");
const student_flag = require("./student_flag");
const student_exhibition = require("./student_exhibition");
const student_graduation = require("./student_graduation");

app.use("/activity", student_activity);
app.use("/prize", student_prize);
app.use("/flag", student_flag);
app.use("/exhibition", student_exhibition);
app.use("/graduation", student_graduation);

module.exports = app;