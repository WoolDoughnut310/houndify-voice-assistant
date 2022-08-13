const express = require("express");
const path = require("path");
const houndifyExpress = require("houndify").HoundifyExpress;
const app = express();
require("dotenv").config({ path: "./.env" });

const PORT = process.env.PORT || 8080;

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

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
