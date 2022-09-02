import { Howler } from "howler";
import playSound, { music } from "../lib/playSound";

const SUCCESS_RESULT = "SuccessfulPlayerCommand";
const FAILED_RESULT = "ClientActionFailedResult";

const VOLUME_DELTA = 5 / 100;

const handlePlayerCommand = (result: any) => {
    try {
        let commandType = result.NativeData.CommandType;
        commandType = commandType.slice(22);

        switch (commandType) {
            case "MUTE":
                music.mute(true);
                break;
            case "UNMUTE":
                music.mute(false);
                break;
            case "RAISE_VOLUME":
                music.volume(Math.min(music.volume() + VOLUME_DELTA, 1));
                break;
            case "LOWER_VOLUME":
                music.volume(Math.max(music.volume() - VOLUME_DELTA, 0));
                break;
            case "STOP":
                music.stop();
                break;
            case "REPLAY":
                music.seek(0);
                break;
            case "FAST_FORWARD":
                const skipAmount =
                    result.NativeData.RewindFastForwardAmountInSeconds;
                music.seek(
                    Math.min(music.seek() + skipAmount, music.duration())
                );
                break;
            case "REWIND":
                const rewindAmount =
                    result.NativeData.RewindFastForwardAmountInSeconds;
                music.seek(Math.max(music.seek() - rewindAmount, 0));
                break;
            case "PAUSE":
                music.pause();
                break;
            case "PLAY_CURRENT_SONG":
                if (result.NativeData.UserRequestedResume) {
                    music.play();
                }
                break;
            case "SEEK":
                if ("SeekOffsetInSeconds" in result.NativeData) {
                    music.seek(result.NativeData.SeekOffsetInSeconds);
                } else if ("SeekOffsetPercentage" in result.NativeData) {
                    music.seek(
                        result.NativeData.SeekOffsetPercentage *
                            music.duration()
                    );
                }
                break;
            case "PLAY_LAST_SONG":
                const lastSong = localStorage.getItem("lastSong");
                if (lastSong) {
                    Howler.stop();
                    playSound(lastSong);
                }
                break;
            default:
                throw new Error();
        }

        return result[SUCCESS_RESULT];
    } catch {
        return result[FAILED_RESULT];
    }
};

export default function handle(result: any) {
    if (!result[SUCCESS_RESULT]) {
        return result;
    }

    return handlePlayerCommand(result);
}
