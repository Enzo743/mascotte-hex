/*
Interfaces utiles (pour simplifier la lecture)
*/
export interface Position {
    x: number;
    y: number
}

/*
Interfaces pour le Graphe orienté
*/
export interface Noeud {
    x: number;
    y: number
}

export interface Arc {
    noeud: Noeud;
    voisins: Noeud[]
}

/*
Interfaces de la structure des fichiers json

CarteJSON est délicat, car le fichier JSON fourni peut être interprété de plusieurs manières.
J'ai considéré que les coordonnées de la forme [x, y] sont des tuples de nombres et non pas une liste de nombres.
Il faut donc convertir le JSON pour qu'il n'y ait pas d'erreurs à la compilation (exemple) :
import carteBrute from "exemple.json" assert {type: "json"};
const carteJSON: CarteJSON = carteBrute as CarteJSON;
*/
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
    connexions: {
        type: string;
        tuiles: [number, number][]
    }[]
}

/*
Interfaces pour l'affichage de la carte
*/
export interface Case {
    id: string;
    positionMatrice: Position;
    positionCanva: Position;
    riviere: boolean;
    type: string;
    couleur: string
}

export interface tyrolienne {
    entree: Position;
    sortie: Position
}

export interface riviere {
    parcours: Position[];
    embouchure: Position
}

export interface Carte {
    taille: {
        lignes: number;
        colonnes: number;
    };
    cases: Case[];
    tyroliennes: tyrolienne[];
    rivieres: riviere[];
}

/*
Interfaces pour le traitement
*/
export interface Contexte {
    carte: Carte;
    graphe: Arc[];
}