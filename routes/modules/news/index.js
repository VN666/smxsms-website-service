const express = require("express");
const app = express();

const news_campus = require("./news_campus");
const news_notice = require("./news_notice");
const news_media = require("./news_media");
const news_enroll = require("./news_enroll");

app.use("/campus", news_campus);
app.use("/notice", news_notice);
app.use("/media", news_media);
app.use("/enroll", news_enroll);

module.exports = app;