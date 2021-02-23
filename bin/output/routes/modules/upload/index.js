const express = require("express");
const app = express();
const imgs = require("./upload_img.js");
const files = require("./upload_file.js");
const deleteImg = require("./delete_img.js");

app.use("/imgs", imgs);
app.use("/files", files);
app.use("/deleteImg", deleteImg);

module.exports = app;