import { Case, Carte, Connexion } from "./Structure";
import { Terrain } from "./Terrain";

export class Jeu {
    rayon: number;
    carte: Carte;
    hexagones: Case[];
    joueur: [number, number];
    ennemi: [number, number];
    mascotteInfo: [number, number];
    mascotteBio: [number, number];
    rivieres: Connexion[];
    tyroliennes: Connexion[];

    constructor(carte: Carte, rayon: number) {
        this.carte = carte;
        this.rayon = rayon;

        this.hexagones = Terrain(carte, rayon);

        this.joueur = [carte.résidences.info[0], carte.résidences.info[1]];
        this.ennemi = [carte.résidences.bio[0], carte.résidences.bio[1]];

        this.mascotteInfo = [carte.résidences.info[0], carte.résidences.info[1]];
        this.mascotteBio  = [carte.résidences.bio[0], carte.résidences.bio[1]];

        this.rivieres = carte.connexions.filter(c => c.type === "riviere");
        this.tyroliennes = carte.connexions.filter(c => c.type === "tyrolienne");
    }

    position(position: [number, number]): Case {
        const [x, y] = position;
        return this.hexagones.find(h => h.id === `${x}-${y}`)!;
    }

}
