const express = require("express");
const path = require("path");
const houndifyExpress = require("houndify").HoundifyExpress;
const app = express();
require("dotenv").config({ path: "./.env" });

app.use(express.static(path.join(__dirname, "build")));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get(
    "/houndifyAuth",
    houndifyExpress.createAuthenticationHandler({
        clientId: process.env.HOUNDIFY_CLIENT_ID,
        clientKey: process.env.HOUNDIFY_CLIENT_KEY,
    })
);

app.get("/textSearchProxy", houndifyExpress.createTextProxyHandler());

app.listen(process.env.PORT || 8080);
