import axios from "axios";
import playSound from "../lib/playSound";
import { Web3Storage } from "web3.storage";
import { toast, ToastContentProps } from "react-toastify";
import { Howler } from "howler";

const SUCCESS_RESULT = "AutoPlayResult";
const FAILED_RESULT = "AutoPlayFailedResult";

//@ts-ignore
const web3Storage = new Web3Storage({
    token: process.env.REACT_APP_WEB3_STORAGE_TOKEN as string,
});

const getTitle = (title: string, artist: string) => {
    return `${title} ${artist}`
        .toLowerCase()
        .replace(/ *\([^)]*\) */g, "")
        .replace(/ *\[[^\]]*]/, "")
        .replace(/feat.|ft./g, "")
        .replace(/\s+/g, " ")
        .trim();
};

const downloadTrack = async (track: any) => {
    let title = getTitle(track.TrackName, track.ArtistName);

    let { data } = await axios.post("/yt-download", null, {
        params: { q: title },
    });

    return data.cid as string;
};

const retrieveFileURL = async (cid: string) => {
    const storageRes = await web3Storage.get(cid);
    const files = await storageRes?.files();

    if (!files) throw new Error();

    const audioURL = URL.createObjectURL(files[0]);

    return audioURL;
};

const handleMusicCommand = async (result: any) => {
    try {
        let track = result.NativeData.Tracks[0];
        const cid = await downloadTrack(track);
        const audioURL = await retrieveFileURL(cid);

        Howler.stop();
        playSound(audioURL, { format: "webm" }, "music");
        localStorage.setItem("lastSong", audioURL);

        // Play music
        return result[SUCCESS_RESULT];
    } catch {
        return result[FAILED_RESULT];
    }
};

export default function handle(result: any) {
    // If there is no successful result
    // then no song will be able to play
    if (!result[SUCCESS_RESULT]) {
        return result;
    }

    switch (result.MusicCommandKind) {
        // Both music command kinds have
        // the same data, it's just a song
        case "MusicChartsCommand":
        case "MusicSearchCommand":
            const onResponse = ({ data }: ToastContentProps<any>) => {
                return data.SpokenResponse;
            };

            return toast.promise(
                handleMusicCommand(result),
                {
                    pending: "Downloading...",
                    success: {
                        render: onResponse,
                    },
                    error: {
                        render: onResponse,
                    },
                },
                { type: "info" }
            );
        default:
            return result;
    }
}
