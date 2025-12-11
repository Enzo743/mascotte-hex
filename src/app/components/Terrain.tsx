import { Carte, Case } from "./Structure";

export function Terrain(carte: Carte, rayon: number): Case[] {
    const hexagones: Case[] = [];
    const rayonInterieur = (rayon / 2) * Math.sqrt(3);

    for (let i = 0; i < carte.grille.lignes; i++) {
        const decalage = i % 2 === 1;
        for (let j = 0; j < carte.grille.colonnes; j++) {
            const position = {
                x: decalage ? rayonInterieur * 2 + j * (2 * rayonInterieur) : rayonInterieur + j * (2 * rayonInterieur),
                y: rayon + i * (rayon + rayon / 2),
            };
            hexagones.push({
                id: `${j}-${i}`,
                position,
                type: "ocean",
                couleur: "#748BF8"
            });
        }
    }

    for (const [i, j] of carte.terrains.plaine)
        type(hexagones, i, j, "plaine", "#62D926");

    for (const [i, j] of carte.terrains.foret)
        type(hexagones, i, j, "foret", "#1A4405");

    for (const [i, j] of carte.terrains.montagne)
        type(hexagones, i, j, "montagne", "#9E9E9E");

    return hexagones;
}

function type(hexagones: Case[], i: number, j: number, type: string, couleur: string) {
    const hexagone = hexagones.find(h => h.id === `${i}-${j}`);
    if (hexagone) {
        hexagone.type = type;
        hexagone.couleur = couleur;
    }
}