const express = require("express");
const app = express();

const about_history =  require("./about_history.js");
const about_honor =  require("./about_honor.js");
const about_landscape =  require("./about_landscape.js");
const about_leader =  require("./about_leader.js");
const about_organization =  require("./about_organization.js");
const about_outstanding =  require("./about_outstanding.js");
const about_profile =  require("./about_profile.js");
const about_proverb =  require("./about_proverb.js");
const about_team =  require("./about_team.js");

app.use("/history", about_history);
app.use("/honor", about_honor);
app.use("/landscape", about_landscape);
app.use("/leader", about_leader);
app.use("/organization", about_organization);
app.use("/outstanding", about_outstanding);
app.use("/profile", about_profile);
app.use("/proverb", about_proverb);
app.use("/team", about_team);

module.exports = app;