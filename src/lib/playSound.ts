import { Howler, Howl, HowlOptions } from "howler";

export default function playSound(
    src: string,
    options?: Omit<HowlOptions, "src">
) {
    Howler.stop();
    new Howl({
        src,
        ...options,
    }).play();
}
