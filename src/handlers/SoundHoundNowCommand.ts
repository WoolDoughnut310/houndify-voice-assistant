import axios from "axios";
import { toast } from "react-toastify";
import say from "../lib/say";

const SUCCESS_RESULT = "SingleTrackWithArtistResult";
const FAILED_RESULT = "NoMatchResult";
const STARTING_RESULT = "StartSoundHoundSearchResult";

const LISTEN_DURATION = 15000;

const sleep = (duration: number) =>
    new Promise((resolve) => setTimeout(resolve, duration));

const recordAudio = async (duration: number) => {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    const audioChunks: Blob[] = [];
    mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
    });

    await sleep(duration);

    await new Promise((resolve) => {
        mediaRecorder.addEventListener("stop", resolve);

        mediaRecorder.stop();
    });

    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });

    return audioBlob;
};

const handleACRCommand = async (result: any) => {
    try {
        say(result[STARTING_RESULT].SpokenResponseLong);

        // Wait for speech to finish before recording
        await sleep(2000);

        const toastID = toast("Listening...", {
            type: "info",
            autoClose: LISTEN_DURATION,
        });
        const audioBlob = await recordAudio(LISTEN_DURATION);
        toast.dismiss(toastID);

        const body = new FormData();
        body.append("file", audioBlob);

        const response = await axios.post(`/acr-identify`, body, {
            timeout: 30000,
        });

        const data = response.data;

        let SpokenResponseLong = result[SUCCESS_RESULT].SpokenResponseLong;
        SpokenResponseLong = SpokenResponseLong.replace(
            "%result_title%",
            data.title
        ).replace("%result_artist%", data.artist);

        return { ...result[SUCCESS_RESULT], SpokenResponseLong };
    } catch (e) {
        return result[FAILED_RESULT];
    }
};

export default function handle(result: any) {
    if (!result[SUCCESS_RESULT]) {
        return result;
    }

    return handleACRCommand(result);
}
