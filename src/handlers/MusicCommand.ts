import axios from "axios";
import playSound from "../lib/playSound";
import { Web3Storage } from "web3.storage";
import { toast, ToastContentProps } from "react-toastify";

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

const searchTrack = async (track: any) => {
    let title = getTitle(track.TrackName, track.ArtistName);

    let { data } = await axios.get("/yt-search", {
        params: { q: title },
    });

    return data.id as string;
};

const downloadYT = async (id: string) => {
    let { data } = await axios.post("/yt-download", {
        id: id,
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
        const ytID = await searchTrack(track);
        const cid = await downloadYT(ytID);
        const audioURL = await retrieveFileURL(cid);

        playSound(audioURL, { format: "webm" });

        // Play music
        return result[SUCCESS_RESULT];
    } catch {
        return result[FAILED_RESULT];
    }
};

export default function handle(result: any) {
    if (!result[SUCCESS_RESULT]) {
        return result;
    }

    switch (result.MusicCommandKind) {
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
    }
}
