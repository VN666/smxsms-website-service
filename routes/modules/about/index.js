const express = require("express");
const app = express();

const about_concept =  require("./about_concept.js");
const about_honor =  require("./about_honor.js");
const about_leader =  require("./about_leader.js");
const about_profile =  require("./about_profile.js");
const about_proverb =  require("./about_proverb.js");

app.use("/concept", about_concept);
app.use("/honor", about_honor);
app.use("/leader", about_leader);
app.use("/profile", about_profile);
app.use("/proverb", about_proverb);

module.exports = app;