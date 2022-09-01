import { Howl, HowlOptions } from "howler";

export let music: Howl;

export default function playSound(
    src: string,
    options?: Omit<HowlOptions, "src">,
    type: "music" | "sound" = "sound"
) {
    const sound = new Howl({
        src,
        ...options,
    });

    if (type === "music") {
        music = sound;
    }

    return sound.play();
}
