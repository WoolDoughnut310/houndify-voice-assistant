import handlePokedexCommand, {
    updatePokemonKeys,
} from "./ClientMatch/handlePokemonCommand";

export default async function handle(result: any) {
    switch (result.Result.action) {
        case "pokedex":
            await updatePokemonKeys();
            return handlePokedexCommand(result);
    }
}
