import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./App.module.scss";
import initVoiceRequest from "./lib/initVoiceRequest";
import VoiceInput from "./VoiceInput";
import { useSetAtom } from "jotai";
import { recorderAtom, recordingAtom } from "./lib/store";

import startSound from "./audio/start.wav";
import stopSound from "./audio/stop.wav";
import handleCommand from "./handlers";
import playSound from "./lib/playSound";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const sources = {
    start: startSound,
    stop: stopSound,
};

const speech = new SpeechSynthesisUtterance();

// Set to your language code
speech.lang = "en";

const say = (text: string) => {
    speech.text = text;
    window.speechSynthesis.speak(speech);
};

function App() {
    // Keep hold of the state
    const conversationState = useRef<any>(null);

    // Holds what the user is currently saying
    const [transcription, setTranscription] = useState("");

    // Any errors from the voice request will be stored here
    const [error, setError] = useState("");

    const setRecorder = useSetAtom(recorderAtom);
    const _setRecording = useSetAtom(recordingAtom);

    const setRecording = (value: boolean) => {
        playSound(sources[value ? "start" : "stop"]);
        _setRecording(value);
    };

    const onResponse = useCallback((response: any, info: any) => {
        if (response.AllResults && response.AllResults.length) {
            const result = response.AllResults[0];
            conversationState.current = result.ConversationState;
            setTranscription("");
            handleResult(result);
        }
    }, []);

    const onTranscriptionUpdate = useCallback((transcript: any) => {
        setTranscription(transcript.PartialTranscript);
    }, []);

    const onError = useCallback((error: any, info: any) => {
        setError(JSON.stringify(error));
    }, []);

    const handleResult = async (result: any) => {
        setError("");
        let newResult = await handleCommand(result);
        say(newResult.SpokenResponseLong);
    };

    useEffect(() => {
        // @ts-ignore (2339)
        const audioRecorder = new window.Houndify.AudioRecorder();
        setRecorder(audioRecorder);

        let voiceRequest: any;

        audioRecorder.on("start", () => {
            setRecording(true);
            voiceRequest = initVoiceRequest(
                audioRecorder,
                conversationState.current,
                {
                    onResponse,
                    onTranscriptionUpdate,
                    onError,
                }
            );
        });

        audioRecorder.on("data", (data: any) => {
            voiceRequest.write(data);
        });

        audioRecorder.on("end", () => {
            voiceRequest.end();
            setRecording(false);
        });

        audioRecorder.on("error", () => {
            voiceRequest.abort();
            setRecording(false);
        });
    }, []);

    return (
        <div className={styles.root}>
            <h1 className={styles.h1}>Assist310</h1>
            <VoiceInput transcription={transcription} />
            {error && <div className={styles.errorContainer}>{error}</div>}
            <ToastContainer />
        </div>
    );
}

export default App;
