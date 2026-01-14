/*
=== Interfaces utiles (pour simplifier la lecture) ===
*/
export interface Position {
    x: number;
    y: number
}

/*
=== Interfaces pour le Graphe orienté ===
*/
export interface Noeud {
    x: number;
    y: number
}

export interface Arc {
    noeud: Noeud;
    voisins: Noeud[]
}

/* === Interfaces pour la selection du mode de jeu ===
*/
export enum Difficulte {
    EXTREME,
    DIFFICILE,
    MOYEN,
    FACILE,
    STUPIDE
}

export type ModeJeu = "" | "pvp" | "bot" | "tvt";

export type PremierTour = "info" | "bio" | "random";

export type DifficulteIA = "stupide" | "facile" | "moyen" | "difficile" | "extreme";
/*
=== Interfaces de la structure des fichiers json ===
CarteJSON est délicat, car le fichier JSON fourni peut être interprété de plusieurs manières.
J'ai considéré que les coordonnées de la forme [x, y] sont des tuples de nombres et non pas une liste de nombres.
Il faut donc convertir le JSON pour qu'il n'y ait pas d'erreurs à la compilation (exemple) :
import carteBrute from "exemple.json" assert {type: "json"};
const carteJSON: CarteJSON = carteBrute as CarteJSON;
*/
export interface Connexion {
    type: string;
    tuiles: [number, number][]    
}

export interface CarteJSON {
    grille: {
        lignes: number;
        colonnes: number
    };
    résidences: {
        info: [number, number];
        bio: [number, number]
    };
    terrains: {
        plaine: [number, number][]; 
        foret: [number, number][]; 
        montagne: [number, number][]
    };
    connexions: Connexion[]
}

/*
=== Interfaces pour le jeu ===
Pour chaque joueur on a sa position, et si il a la mascotte ou non
Cette implémentation permet de connaître la position de la mascotte ennemie sans avoir un objet mascotte distinct
*/
export interface Joueur {
    position: Position;
    mascotte: boolean;
}

/*
=== Interfaces pour l'affichage de la carte ===
On convertit le fichier Json d'origine en plusieurs objets mieux organisés pour le traitement
*/
export interface AffichageParams {
    contexte: Contexte;
    rayon: number;
    tour: number;
    pion: number;
    deplacement?: (position: Position) => void;
    brouillard: boolean;
    equipe: boolean;
}

export interface Case {
    id: string;
    positionMatrice: Position;
    positionCanvas: Position;
    residenceInfo: boolean;
    residenceBio: boolean;
    riviere: {nombre: number; sorties: Position[]};
    tyrolienne: {nombre: number; sorties: Position[]};
    type: string;
    couleur: string
}

export interface Tyrolienne {
    entree: Position;
    sortie: Position
}

export interface Riviere {
    parcours: Position[];
    embouchure: Position // Séparation de la dernière case de chaque rivière, utile pour son traitement
}

export interface Barrage {
    position: Position;
}

export interface Carte {
    taille: {
        lignes: number;
        colonnes: number;
    };
    cases: Case[];
    residenceInfo: Position;
    residenceBio: Position;
    tyroliennes: Tyrolienne[];
    rivieres: Riviere[];
}

/*
=== Interfaces pour le traitement ===
Condense les informations utiles sur le jeu un un unique objet
*/
export interface Contexte {
    carte: Carte;
    graphe: Arc[];
    joueurInfo: Joueur;
    joueurInfo2: Joueur;
    joueurBio: Joueur;
    joueurBio2: Joueur
}

/*
=== File ===
Implémentation d'une classe représentant une file de positions.
Nécessaire pour connaître le plus court chemin entre deux noeuds dans un graphe
*/
export class File {
    private elements: Position[] = [];

    enfiler(position: Position): void {
        this.elements.push(position);
    }
    defiler(): Position | undefined {
        return this.elements.shift();
    }
    estVide(): boolean {
        return this.elements.length === 0;
    }
}

export type CarteAJouer = "surveillant" | "copiesACorriger" | "constructionBarrage" | "destructionBarrage" 
    | "destructionTyrolienne" | "reparationTyrolienne" | undefined;

export class Pioche {
    private pioche: CarteAJouer[] = [];

    // Ajouter une carte à la pioche
    ajouter(carte: CarteAJouer | undefined): void { 
        this.pioche.push(carte);
    }

    // Retire et renvoie la carte indice 0 de la pioche
    piocher(): CarteAJouer | undefined { 
        return this.pioche.shift();
    }

    // Melange la pioche
    melanger(): void {
        for (let i = this.pioche.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // indice aléatoire entre 0 et i
            [this.pioche[i], this.pioche[j]] = [this.pioche[j], this.pioche[i]];   // permutation via déstructuration
        }
    }
}