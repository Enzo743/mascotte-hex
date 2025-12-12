import {Arc, Carte, CarteJSON, Case, Connexion, Contexte, Position, Riviere} from "./Interfaces";

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
    const rayonInterieur: number = (rayon / 2) * Math.sqrt(3);

    // Initialise chaque case bien positionnée pour le canvas
    // Par défaut, le type est océan
    for (let i: number = 0; i < carte.taille.lignes; i++) {
        const decalage: boolean = i % 2 === 1; // Important pour un affichage avec des hexagones
        for (let j: number = 0; j < carte.taille.colonnes; j++) {
            const x: number = decalage ? rayonInterieur * 2 + j * (2 * rayonInterieur) : rayonInterieur + j * (2 * rayonInterieur);
            const y: number = rayon + i * (rayon + rayon / 2);
            carte.cases.push({
                id: `${j}-${i}`, // sachant j (les colonnes, la largeur) alias x et i (les lignes, la hauteur) alias y, l'identifiant est représenté sous la forme (x,y)
                positionMatrice: {x: j, y: i},
                positionCanvas: {x: x, y: y},
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

    // Affectation des connexions de type tyrolienne
    carteJSON.connexions.filter(c => c.type === "tyrolienne").forEach((connexion: Connexion) => {
        carte.tyroliennes.push({
            entree: {
                x: connexion.tuiles[0][0],
                y: connexion.tuiles[0][1]
            },
            sortie: {
                x: connexion.tuiles[1][0],
                y: connexion.tuiles[1][1]
            }
        });
    });

    // Affectation des connexions de type riviere
    carteJSON.connexions.filter(c => c.type === "riviere").forEach((connexion: Connexion) => {
        const riviere: Riviere = {
            parcours: [],
            embouchure: {
                x: connexion.tuiles[connexion.tuiles.length - 1][0],
                y: connexion.tuiles[connexion.tuiles.length - 1][1]
            }
        }
        for (let i: number = 0; i < connexion.tuiles.length - 2; i++) {
            riviere.parcours.push({
                x: connexion.tuiles[i][0],
                y: connexion.tuiles[i][1]
            })
            const affectation: Case | undefined = carte.cases.find(c => c.id === `${connexion.tuiles[i][0]}-${connexion.tuiles[i][1]}`);
            if (affectation) {
                affectation.riviere = true;
            }
        }
        carte.rivieres.push(riviere);
    });

    // Cas où une rivière se jette dans une autre
    carte.rivieres.forEach((riviere: Riviere) => {
        const embouchure: Position = riviere.embouchure;
        const caseEmbouchure: Case | undefined = carte.cases.find(c => c.id === `${embouchure.x}-${embouchure.y}`);
        if (!caseEmbouchure || !caseEmbouchure.riviere) return;
        const extension: Riviere | undefined = carte.rivieres.find(r =>
            r.parcours.some(p => p.x === embouchure.x && p.y === embouchure.y)
        );
        if (!extension) return;
        const indice: number = extension.parcours.findIndex(p => p.x === embouchure.x && p.y === embouchure.y);
        if (indice === -1) return;
        const suite: Position[] = extension.parcours.slice(indice);
        riviere.parcours.push(...suite);
        riviere.embouchure = extension.embouchure;
    });

    // On retourne l'objet Contexte
    return {
        carte: carte,
        graphe: graphe
    };
}

// Fonction d'affectation des types d'environnements à une case par son id
function type(cases: Case[], x: number, y: number, type: string, couleur: string) : void {
    const affectation: Case | undefined = cases.find(c => c.id === `${x}-${y}`);
    if (affectation) {
        affectation.type = type;
        affectation.couleur = couleur;
    }
}