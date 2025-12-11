// Interface des Cartes
export interface Connexion {
    type: string;
    tuiles: number[][];
}
export interface Carte {
        grille: {lignes: number; colonnes: number};
        résidences: {info: number[]; bio: number[]};
        terrains: {
            plaine: number[][]; 
            foret: number[][]; 
            montagne: number[][];
        };
        connexions: Connexion[];
}

// Interface des Cases (Hexagones)
export interface Case {
    id: string;
    position: {x: number; y: number};
    type: string;
    couleur: string;
}