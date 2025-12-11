import {Carte, CarteJSON, Contexte, Arc, Case} from "./Interfaces";

/*
--- Traitement Total ---
Prends en entrée une carte en format JSON et en sort le contexte, des informations utiles pour la suite du jeu.
Ce type de traitement peut être utilisé en début de partie, quand la carte n'a pas encore été générée.
En revanche, il faut éviter de l'utiliser si l'on veut mettre à jour seulement le graphe, par exemple (calculs inutiles).
D'autres fonctions seront développées à cet effet.

/!\ Pas encore fini, et il est tard là
*/
export function TraitementTotal(carteJSON: CarteJSON, rayon: number): Contexte {
    // Constantes de retour
    const carte: Carte = {
        taille: {
            lignes: carteJSON.grille.lignes,
            colonnes : carteJSON.grille.colonnes
        },
        cases: [],
        tyroliennes: [],
        rivieres: []
    };
    const graphe: Arc[] = [];

    // Calcul du rayon intérieur pour correctement placer les éléments sur la carte par la suite
    const rayonInterieur = (rayon / 2) * Math.sqrt(3);

    // Initialise chaque case bien positionnée pour le canvas
    // Par défaut, le type est océan
    for (let i = 0; i < carte.taille.lignes; i++) {
        const decalage = i % 2 === 1; // Important pour un affichage avec des hexagones
        for (let j = 0; j < carte.taille.colonnes; j++) {
            const x: number = decalage ? rayonInterieur * 2 + j * (2 * rayonInterieur) : rayonInterieur + j * (2 * rayonInterieur);
            const y: number = rayon + i * (rayon + rayon / 2);
            carte.cases.push({
                id: `${j}-${i}`, // sachant j (les colonnes, la largeur) alias x et i (les lignes, la hauteur) alias y, l'identifiant est représenté sous la forme (x,y)
                positionMatrice: {x: j, y: i},
                positionCanva: {x: x, y: y},
                riviere: false,
                type: "ocean", // Todo : utiliser plutôt une énumération ?
                couleur: "#748BF8" // Todo : plutôt implémenter les couleurs dans la partie visuelle.
            });
        }
    }

    // Affectation correcte des types d'environnements
    for (const [x, y] of carteJSON.terrains.plaine) {
        type(carte.cases, x, y, "plaine", "#62D926");
    }
    for (const [x, y] of carteJSON.terrains.foret) {
        type(carte.cases, x, y, "foret", "#1A4405");
    }
    for (const [x, y] of carteJSON.terrains.montagne) {
        type(carte.cases, x, y, "montagne", "#9E9E9E");
    }

    // On retourne l'objet Contexte
    return {
        carte: carte,
        graphe: graphe
    };
}

// Fonction d'affectation des types d'environnements à une case par son id
function type(cases: Case[], x: number, y: number, type: string, couleur: string) : void {
    const affectation = cases.find(c => c.id === `${x}-${y}`);
    if (affectation) {
        affectation.type = type;
        affectation.couleur = couleur;
    }
}