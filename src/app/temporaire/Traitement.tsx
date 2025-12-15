import {Arc, Carte, CarteJSON, Case, Connexion, Contexte, Joueur, Position, Riviere, Tyrolienne} from "./Interfaces";

/*
=== Traitement Total ===
Génère la carte du jeu ainsi que le graphe associé.
Appeler cette fonction uniquement en début de partie ou si changer la carte ainsi que le graphe est nécessaire.
*/
export function TraitementTotal(carteJSON: CarteJSON, rayon: number, joueurs: [Joueur, Joueur]): Contexte {
    const carte: Carte = TraitementCarte(carteJSON, rayon);
    const graphe: Arc[] = TraitementGraphe(carte, joueurs);
    return {
        carte: carte,
        graphe: graphe
    };
}

/*
=== Traitement Carte ===
Prends en entrée la carte du jeu précédemment générée et construis un graphe orienté.
Il représente tous les déplacements possibles, utile pour l'implémentation des règles du jeu, mais surtout pour le bot.
*/
export function TraitementCarte(carteJSON: CarteJSON, rayon: number): Carte {
    const carte: Carte = {
        taille: {
            lignes: carteJSON.grille.lignes,
            colonnes : carteJSON.grille.colonnes
        },
        cases: [],
        residenceInfo: {
            x: carteJSON.résidences.info[0],
            y: carteJSON.résidences.info[1]
        },
        residenceBio: {
            x: carteJSON.résidences.bio[0],
            y: carteJSON.résidences.bio[1]
        },
        tyroliennes: [],
        rivieres: []
    };

    // Calcul du rayon intérieur pour correctement placer les éléments sur la carte par la suite.
    const rayonInterieur: number = (rayon / 2) * Math.sqrt(3);

    // Initialise chaque case bien positionnée pour le canvas.
    // Par défaut, le type est océan.
    for (let i: number = 0; i < carte.taille.lignes; i++) {
        const decalage: boolean = i % 2 === 1; // Important pour un affichage avec des hexagones.
        for (let j: number = 0; j < carte.taille.colonnes; j++) {
            const x: number = decalage ? rayonInterieur * 2 + j * (2 * rayonInterieur) : rayonInterieur + j * (2 * rayonInterieur);
            const y: number = rayon + i * (rayon + rayon / 2);
            carte.cases.push({
                id: `${j}-${i}`, // sachant j (les colonnes, la largeur) alias x et i (les lignes, la hauteur) alias y, l'identifiant est représenté sous la forme (x,y).
                positionMatrice: {x: j, y: i},
                positionCanvas: {x: x, y: y},
                residenceInfo: carteJSON.résidences.info[0] === j && carteJSON.résidences.info[0] === i ? true : false,
                residenceBio: carteJSON.résidences.bio[0] === j && carteJSON.résidences.info[0] === i ? true : false,
                riviere: false,
                type: "ocean", // Todo : utiliser plutôt une énumération ?
                couleur: "#748BF8" // Todo : plutôt implémenter les couleurs dans la partie visuelle.
            });
        }
    }

    // Affectation correcte des types d'environnements.
    for (const [x, y] of carteJSON.terrains.plaine) {
        type(carte.cases, x, y, "plaine", "#62D926");
    }
    for (const [x, y] of carteJSON.terrains.foret) {
        type(carte.cases, x, y, "foret", "#1A4405");
    }
    for (const [x, y] of carteJSON.terrains.montagne) {
        type(carte.cases, x, y, "montagne", "#9E9E9E");
    }

    // Affectation des connexions de type tyrolienne.
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

    // Affectation des connexions de type riviere.
    carteJSON.connexions.filter(c => c.type === "riviere").forEach((connexion: Connexion) => {
        const riviere: Riviere = {
            parcours: [],
            embouchure: {
                x: connexion.tuiles[connexion.tuiles.length - 1][0],
                y: connexion.tuiles[connexion.tuiles.length - 1][1]
            }
        }
        for (let i: number = 0; i < connexion.tuiles.length - 1; i++) {
            riviere.parcours.push({
                x: connexion.tuiles[i][0],
                y: connexion.tuiles[i][1]
            })
            const affectation: Case | undefined = carte.cases.find(c => c.id === `${connexion.tuiles[i][0]}-${connexion.tuiles[i][1]}`);
            if (affectation) {
                affectation.riviere = true; // Important pour la suite (graphe).
            }
        }
        carte.rivieres.push(riviere);
    });

    return carte;
}

/*
=== Traitement Graphe ===
Prends en entrée la carte du jeu précédemment générée et construis un graphe orienté.
Il représente tous les déplacements possibles, utile pour l'implémentation des règles du jeu, mais surtout pour le bot.
*/
export function TraitementGraphe(carte: Carte, joueurs: [Joueur, Joueur]): Arc[] {
    const graphe: Arc[] = [];

    // Ajout des arêtes entre les différents terrains.
    for (let i: number = 0; i < carte.taille.colonnes; i++) {
        for (let j: number = 0; j < carte.taille.lignes; j++) {  
            const arc: Arc = {
                noeud: {x: i, y: j},
                voisins: []
            };
            const affectation: Case | undefined = carte.cases.find(c => c.id === `${i}-${j}`);
            if (affectation && !(affectation.type === "ocean") && !(affectation.type === "montagne")) { // Si la case est un océan ou une montagne, elle n'a pas de voisins.
                const adjacents: number[][] = (j%2 == 1) ? [[i,j-1],[i+1,j-1],[i-1,j],[i+1,j],[i,j+1],[i+1,j+1]] : [[i-1,j-1],[i,j-1],[i-1,j],[i+1,j],[i-1,j+1],[i,j+1]]; // Matrice d'adjacence dans une grille d'hexagones.
                adjacents.forEach((adjacent: number[]) => {
                    const voisin: Case | undefined = carte.cases.find(c => c.id === `${adjacent[0]}-${adjacent[1]}`);
                    if (voisin && !(voisin.type === "ocean") && !(voisin.type === "montagne")) {
                        arc.voisins.push({
                            x: voisin.positionMatrice.x,
                            y: voisin.positionMatrice.y
                        });
                    }
                });
            }
            graphe.push(arc);
        }
    }

    // Ajout des arêtes liées aux tyroliennes.
    carte.tyroliennes.forEach((tyrolienne: Tyrolienne) => {
        const affectation: Arc | undefined = graphe.find(g =>
            (g.noeud.x === tyrolienne.entree.x) &&
            (g.noeud.y === tyrolienne.entree.y)
        );
        if (affectation) {
            affectation.voisins.push({
                x: tyrolienne.sortie.x,
                y: tyrolienne.sortie.y
            });
        }
    });



    // Ajout des arêtes liées aux rivières.
    // Alors, ça marche, mais c'est affreusement optimisé.
    // 
    // Todo : Factoriser et optimiser le code.
    carte.rivieres.forEach((riviere: Riviere) => {
        const embouchure: Case | undefined = carte.cases.find(c => c.id === `${riviere.embouchure.x}-${riviere.embouchure.y}`);
        if (embouchure) {
            if (embouchure.type !== "ocean") { // Si la rivière ne finit dans l'océan, elle doit rejoindre une autre rivière (galère à implémenter).
                for(let i: number = 0; i < riviere.parcours.length - 3; i++) {
                    const affectation: Arc | undefined = graphe.find(g =>
                        (g.noeud.x === riviere.parcours[i].x) &&
                        (g.noeud.y === riviere.parcours[i].y)
                    );
                    if (affectation) {
                        affectation.voisins.push({
                            x: riviere.parcours[i+3].x,
                            y: riviere.parcours[i+3].y 
                        });
                    }
                }
                if (riviere.parcours.length >= 3) {
                    const affectation: Arc | undefined = graphe.find(g =>
                        (g.noeud.x === riviere.parcours[riviere.parcours.length - 3].x) &&
                        (g.noeud.y === riviere.parcours[riviere.parcours.length - 3].y)
                    );
                    if (affectation) {
                        affectation.voisins.push({
                            x: riviere.embouchure.x,
                            y: riviere.embouchure.y 
                        });
                    }
                }
                if (riviere.parcours.length >= 2) {
                    const affectation: Arc | undefined = graphe.find(g =>
                        (g.noeud.x === riviere.parcours[riviere.parcours.length - 2].x) &&
                        (g.noeud.y === riviere.parcours[riviere.parcours.length - 2].y)
                    );
                    const extension: Riviere | undefined = carte.rivieres.find(r => r.parcours.some(p => p.x === riviere.embouchure.x && p.y === riviere.embouchure.y));
                    if (extension) {
                        const indice: number = extension.parcours.findIndex(p => p.x === riviere.embouchure.x && p.y === riviere.embouchure.y);
                        if (indice) {
                            const suite: Position[] = extension.parcours.slice(indice);
                            if (affectation) {
                                if (suite.length >= 2) {
                                    affectation.voisins.push({
                                        x: suite[1].x,
                                        y: suite[1].y 
                                    });
                                } else {
                                    affectation.voisins.push({
                                        x: riviere.embouchure.x,
                                        y: riviere.embouchure.y 
                                    });
                                } 
                            }
                        }
                    }
                }
                if (riviere.parcours.length >= 1) {
                    const affectation: Arc | undefined = graphe.find(g =>
                        (g.noeud.x === riviere.parcours[riviere.parcours.length - 1].x) &&
                        (g.noeud.y === riviere.parcours[riviere.parcours.length - 1].y)
                    );
                    const extension: Riviere | undefined = carte.rivieres.find(r => r.parcours.some(p => p.x === riviere.embouchure.x && p.y === riviere.embouchure.y));
                    if (extension) {
                        const indice: number = extension.parcours.findIndex(p => p.x === riviere.embouchure.x && p.y === riviere.embouchure.y);
                        if (indice) {
                            const suite: Position[] = extension.parcours.slice(indice);
                            if (affectation) {
                                if (suite.length >= 3) {
                                    affectation.voisins.push({
                                        x: suite[2].x,
                                        y: suite[2].y 
                                    });
                                } else if (suite.length >= 2) {
                                    affectation.voisins.push({
                                        x: suite[1].x,
                                        y: suite[1].y 
                                    });
                                } else {
                                    affectation.voisins.push({
                                        x: riviere.embouchure.x,
                                        y: riviere.embouchure.y 
                                    });
                                }
                            }
                        }
                    }
                }
            } else { // Si la rivère finit dans un océan, c'est plus facile.
                for(let i: number = 0; i < riviere.parcours.length - 3; i++) {
                    const affectation: Arc | undefined = graphe.find(g =>
                        (g.noeud.x === riviere.parcours[i].x) &&
                        (g.noeud.y === riviere.parcours[i].y)
                    );
                    if (affectation) {
                        affectation.voisins.push({
                            x: riviere.parcours[i+3].x,
                            y: riviere.parcours[i+3].y 
                        });
                    }
                }
                if (riviere.parcours.length >= 3) {
                    const affectation: Arc | undefined = graphe.find(g =>
                        (g.noeud.x === riviere.parcours[riviere.parcours.length - 3].x) &&
                        (g.noeud.y === riviere.parcours[riviere.parcours.length - 3].y)
                    );
                    if (affectation) {
                        affectation.voisins.push({
                            x: riviere.parcours[riviere.parcours.length - 1].x,
                            y: riviere.parcours[riviere.parcours.length - 1].y 
                        });
                    }
                }
                if (riviere.parcours.length >= 2) {
                    const affectation: Arc | undefined = graphe.find(g =>
                        (g.noeud.x === riviere.parcours[riviere.parcours.length - 2].x) &&
                        (g.noeud.y === riviere.parcours[riviere.parcours.length - 2].y)
                    );
                    if (affectation) {
                        affectation.voisins.push({
                            x: riviere.parcours[riviere.parcours.length - 1].x,
                            y: riviere.parcours[riviere.parcours.length - 1].y 
                        });
                    }
                }
            }
        }
    });

    // Retire les arêtes qui vont vers les joueurs, pour éviter qu'ils empruntent la même case.
    // Ça pose des problèmes pour le bot, qui au début de la partie ne peut pas trouver de plus court chemin si le nœud d'arrivée n'est pas accessible.
    // ^ Probablement besoin d'utiliser les cases adjacentes pour que le bot se déplace quand même.
    const positionsJoueurs: Position[] = joueurs.map(joueur => joueur.position);
    for (const arc of graphe) {
        arc.voisins = arc.voisins.filter(voisin => 
            !positionsJoueurs.some(pos => pos.x === voisin.x && pos.y === voisin.y)
        );
    }

    return graphe;
}

/*
=== TraitementJoueurInitial ===
Affecte les coordonnées initiales (celles de leur résidence respective) à chaque joueur.
*/
export function TraitementJoueurInitial(carteJSON: CarteJSON, type: string): Joueur {
    if (type === "info") {
        return {
            position: {
                x: carteJSON.résidences.info[0],
                y: carteJSON.résidences.info[1]
            },
            mascotte: false
        };
    } else {
        return {
            position: {
                x: carteJSON.résidences.bio[0],
                y: carteJSON.résidences.bio[1]
            },
            mascotte: false
        };
    }
}

// Fonction d'affectation des types d'environnements à une case par son id.
function type(cases: Case[], x: number, y: number, type: string, couleur: string) : void {
    const affectation: Case | undefined = cases.find(c => c.id === `${x}-${y}`);
    if (affectation) {
        affectation.type = type;
        affectation.couleur = couleur;
    }
}