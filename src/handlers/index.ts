// Stores the command kinds from Houndify that we are able
// to process, with a respective module in the directory
const COMMANDS = ["MusicCommand"];

// Returns a new version of the result, typically
// result["ClientActionSucceededResult"], or just the initial result
export default async function handleCommand(result: any) {
    const command = result.CommandKind;
    if (!COMMANDS.includes(command)) return result;

    const { default: commandHandler } = await import(`./${command}`);

    return await commandHandler(result);
}
