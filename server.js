const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const search = require("youtube-search");
const { default: YTDlpWrap } = require("yt-dlp-wrap");
const houndifyExpress = require("houndify").HoundifyExpress;
const app = express();
const { Web3Storage } = require("web3.storage");

const { existsSync } = require("fs");
const fs = require("fs/promises");

require("dotenv").config({ path: "./.env" });

const PORT = process.env.PORT || 8080;

const ytDlpWrap = new YTDlpWrap("./binaries/yt-dlp.exe");

const web3Storage = new Web3Storage({
    token: process.env.REACT_APP_WEB3_STORAGE_TOKEN,
});

const cidFilename = "song_cids.json";

app.use(bodyParser.json());
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

app.post("/yt-download", async function (req, res) {
    try {
        const ytID = await searchYT(req.query.q);

        // First look through our store
        let cid = (await readCIDFile())[ytID];

        if (cid) {
            return res.json({ cid });
        }

        cid = await uploadYTToWeb3(ytID);
        res.json({
            cid,
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// Helper functions
const searchYT = async (q) => {
    const { results } = await search(q, {
        key: process.env.YOUTUBE_DATA_API_KEY,
        maxResults: 3,
    });
    const result = results[0];

    return result.id;
};

const readCIDFile = async () => {
    let data = {};
    if (existsSync(cidFilename)) {
        const rawData = await fs.readFile(cidFilename);

        if (rawData.length > 0) {
            data = JSON.parse(rawData);
        }
    }

    return data;
};

const saveCIDMapping = async (ytID, cid) => {
    let data = await readCIDFile();
    data[ytID] = cid;
    await fs.writeFile(cidFilename, JSON.stringify(data));
};

const uploadYTToWeb3 = async (ytID) => {
    const ytdlpArgs = [
        `https://www.youtube.com/watch?v=${ytID}`,
        "-f",
        "ba",
        "--ffmpeg-location",
        ".",
    ];

    const filename = `${ytID}.webm`;
    let cid = await web3Storage.put([
        { name: filename, stream: () => ytDlpWrap.execStream(ytdlpArgs) },
    ]);

    await saveCIDMapping(ytID, cid);
    return cid;
};
