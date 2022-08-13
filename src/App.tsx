import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./App.module.scss";
import initVoiceRequest from "./initVoiceRequest";
import VoiceInput from "./VoiceInput";
import { useAtom } from "jotai";
import { recorderAtom, recordingAtom } from "./store";
import { Howl } from "howler";

import startSound from "./audio/start.wav";
import stopSound from "./audio/stop.wav";

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
    const voiceRequest = useRef<any>(null);
    const conversationState = useRef<any>(null);
    const [transcription, setTranscription] = useState("");
    const [error, setError] = useState("");

    const [recorder, setRecorder] = useAtom(recorderAtom);
    const [recording, _setRecording] = useAtom(recordingAtom);
    const [result, setResult] = useState<{ [key: string]: any }>({});

    const setRecording = (value: boolean) => {
        playSound(sources[value ? "start" : "stop"]);
        _setRecording(value);
    };

    const playSound = (src: string) => {
        new Howl({
            src,
        }).play();
    };

    const onResponse = useCallback((response: any, info: any) => {
        if (response.AllResults && response.AllResults.length) {
            const result = response.AllResults[0];
            conversationState.current = result.ConversationState;
            setResult(result);
            handleResult(result);
            setTranscription("");
        }
    }, []);

    const onTranscriptionUpdate = useCallback((transcript: any) => {
        setTranscription(transcript.PartialTranscript);
    }, []);

    const onError = useCallback((error: any, info: any) => {
        setError(JSON.stringify(error));
    }, []);

    const handleResult = (result: any) => {
        // We'll add more here later
        say(result["SpokenResponseLong"]);
    };

    useEffect(() => {
        // @ts-ignore (2339)
        const audioRecorder = new window.Houndify.AudioRecorder();
        setRecorder(audioRecorder);

        audioRecorder.on("start", () => {
            setRecording(true);
            voiceRequest.current = initVoiceRequest(
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
            voiceRequest.current.write(data);
        });

        audioRecorder.on("end", () => {
            voiceRequest.current.end();
            setRecording(false);
        });

        audioRecorder.on("error", () => {
            voiceRequest.current.abort();
            setRecording(false);
        });
    }, []);

    useEffect(() => {
        if (!Object.keys(result).length) return;
    }, [result]);

    return (
        <div className={styles.root}>
            <h1 className={styles.h1}>Assist310</h1>
            <VoiceInput transcription={transcription} />
            {error && <div className={styles.errorContainer}>{error}</div>}
        </div>
    );
}

export default App;
