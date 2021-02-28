const express = require("express");
const app = express();
const imgs = require("./upload_img.js");
const files = require("./upload_file.js");
const deleteImg = require("./delete_img.js");
const media = require("./upload_media.js");
const deleteFile = require("./delete_file.js");

app.use("/imgs", imgs);
app.use("/files", files);
app.use("/delete_img", deleteImg);
app.use("/media", media);
app.use("/delete_file", deleteFile);

module.exports = app;