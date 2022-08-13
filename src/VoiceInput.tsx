import { Wave } from "@foobar404/wave";
import { useAtom } from "jotai";
import { useRef } from "react";
import { Mic, MicOff } from "react-feather";
import { recorderAtom, recordingAtom } from "./store";
import styles from "./VoiceInput.module.scss";

interface VoiceInputProps {
    transcription: string;
}

export default function VoiceInput({ transcription }: VoiceInputProps) {
    const wave = useRef<Wave | null>(null);
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const [recorder] = useAtom(recorderAtom);
    const [recording] = useAtom(recordingAtom);

    const onClickMic = () => {
        if (recorder && recorder.isRecording()) {
            recorder.stop();
            return;
        }

        recorder.start();

        recorder.on("start", () => {
            if (canvasEl.current) {
                wave.current = new Wave(
                    {
                        source: recorder.source as MediaElementAudioSourceNode,
                        context: recorder.audioCtx as AudioContext,
                    },
                    canvasEl.current
                );
                wave.current.addAnimation(
                    new wave.current.animations.Lines({
                        top: true,
                    })
                );
            }
        });
    };

    const Icon = recording ? MicOff : Mic;

    return (
        <div className={styles.inputContainer}>
            <button
                type="button"
                title={`${recording ? "Stop" : "Start"} voice query`}
                onClick={onClickMic}
            >
                <Icon size={64} color="#343434" />
            </button>
            <div>
                <div className={styles.transcript}>{transcription}</div>
                <canvas ref={canvasEl} width={300} height={150} />
            </div>
        </div>
    );
}
