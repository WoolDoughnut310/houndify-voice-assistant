import { PokemonClient } from "pokenode-ts";

const pokedex = new PokemonClient();

let pokemonKeys: string[];

export const updatePokemonKeys = async () => {
    if (pokemonKeys) return pokemonKeys;

    const firstPokemonData = await pokedex.getPokemonById(1);
    const data = parsePokemonData(firstPokemonData);
    pokemonKeys = Object.keys(data);
    return pokemonKeys;
};

const parsePokemonData = (data: {
    [key: string]: any;
}): { [key: string]: any } => {
    let stats: { [key: string]: number } = {};
    let statData;

    for (let i = 0; i < data.stats.length; i++) {
        statData = data.stats[i];
        stats[statData.stat.name.replace("-", " ")] = statData.base_stat;
    }

    return {
        name: data.name,
        id: data.id,
        height: data.height * 10 + "cm",
        weight: data.weight / 10 + "kg",
        moves: data.moves.map((move: any) => move.move.name).join(", "),
        types: data.types.map((type: any) => type.type.name).join(", "),
        abilities: data.abilities.map((ability: any) => ability.ability.name),
        ...stats,
    };
};

export default async function handlePokedexCommand(result: any) {
    try {
        let name = window.prompt("Enter pokemon name");
        let stat = window.prompt("Enter stat");

        if (!name) {
            throw new Error("Invalid name");
        }

        if (!stat) {
            throw new Error("Invalid stat");
        }

        name = name.toLowerCase();
        stat = stat.toLowerCase();

        const pokemonData = await pokedex.getPokemonByName(name);
        const data = parsePokemonData(pokemonData);
        const statValue = data[stat];

        const response = `${name}'s ${stat} is ${statValue}`;

        return { ...result, SpokenResponseLong: response };
    } catch (error: any) {
        let response = "Unable to access pokemon data";

        if (error.response?.status === 404) {
            response = "Pokemon not found";
        }

        return { ...result, SpokenResponseLong: response };
    }
}
