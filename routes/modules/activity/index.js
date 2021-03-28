const express = require("express");
const app = express();

const activity_planning = require("./activity_planning");
const activity_pacesetter = require("./activity_pacesetter");
const activity_health = require("./activity_health");
const activity_culture = require("./activity_culture");
const activity_teacher = require("./activity_teacher");
const activity_gym = require("./activity_gym");

app.use("/planning", activity_planning);
app.use("/pacesetter", activity_pacesetter);
app.use("/health", activity_health);
app.use("/culture", activity_culture);
app.use("/teacher", activity_teacher);
app.use("/gym", activity_gym);

module.exports = app;