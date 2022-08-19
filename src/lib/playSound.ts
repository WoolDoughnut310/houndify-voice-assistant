import { Howl, HowlOptions } from "howler";

export default function playSound(
    src: string,
    options?: Omit<HowlOptions, "src">
) {
    new Howl({
        src,
        ...options,
    }).play();
}
