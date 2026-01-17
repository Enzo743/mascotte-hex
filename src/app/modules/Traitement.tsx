// Dépendances
import {Arc, Carte, CarteJSON, Case, Connexion, Contexte, Joueur, Position, Riviere, Tyrolienne} from "./Interfaces";

/*
=== Traitement Total ===
Génère la carte du jeu ainsi que le graphe associé.
Appeler cette fonction uniquement en début de partie ou si changer la carte ainsi que le graphe est nécessaire.
*/
export function TraitementTotal(carteJSON: CarteJSON, rayon: number, tour: number, equipe: boolean, surveillants: Position[], castors: Position[], casse: Position[]): Contexte {
    const carte: Carte = TraitementCarte(carteJSON, rayon);
    const joueurInfo: Joueur = {
            position: {
                x: carteJSON.résidences.info[0],
                y: carteJSON.résidences.info[1]
            },
            mascotte: false
    }
    const joueurInfo2: Joueur = {
            position: {
                x: carteJSON.résidences.info[0],
                y: carteJSON.résidences.info[1]
            },
            mascotte: false
    }
    const joueurBio: Joueur = {
            position: {
                x: carteJSON.résidences.bio[0],
                y: carteJSON.résidences.bio[1]
            },
            mascotte: false
    }
    const joueurBio2: Joueur = {
            position: {
                x: carteJSON.résidences.bio[0],
                y: carteJSON.résidences.bio[1]
            },
            mascotte: false
    }
    const graphe: Arc[] = TraitementGraphe(carte, joueurInfo, joueurBio, joueurInfo2, joueurBio2, tour, equipe, surveillants, castors, casse);

    return {
        carte: carte,
        graphe: graphe,
        joueurInfo,
        joueurInfo2,
        joueurBio,
        joueurBio2
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
                positionCanvas: {x: 10+x, y: 10+y},
                residenceInfo: carteJSON.résidences.info[0] === j && carteJSON.résidences.info[0] === i ? true : false,
                residenceBio: carteJSON.résidences.bio[0] === j && carteJSON.résidences.info[0] === i ? true : false,
                riviere: {nombre: 0, sorties: []},
                tyrolienne: {nombre: 0, sorties: []},
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
        const affectation: Case | undefined = carte.cases.find(c => c.id === `${connexion.tuiles[0][0]}-${connexion.tuiles[0][1]}`);
        if (affectation) {
            affectation.tyrolienne.nombre++;
            affectation.tyrolienne.sorties.push({x: connexion.tuiles[1][0], y: connexion.tuiles[1][1]});
        }
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
export function TraitementGraphe(carte: Carte, joueurInfo: Joueur, joueurBio: Joueur, joueurInfo2: Joueur, joueurBio2: Joueur, tour: number, equipe: boolean, surveillants: Position[], castors: Position[], casse: Position[]): Arc[] {
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

    carte.cases.forEach(c => {
        c.riviere.sorties = [];
        c.riviere.nombre = 0;
        c.tyrolienne.sorties = [];
        c.tyrolienne.nombre = 0;
    });

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

            const caseEntree = carte.cases.find(c => 
                c.positionMatrice.x === tyrolienne.entree.x && 
                c.positionMatrice.y === tyrolienne.entree.y
            );
            if (caseEntree) {
                caseEntree.tyrolienne.nombre++;
                caseEntree.tyrolienne.sorties.push({
                    x: tyrolienne.sortie.x, 
                    y: tyrolienne.sortie.y
                });
            }
        }
    });

    const estCastor = (x: number, y: number): boolean => {
        return castors.some(c => c.x === x && c.y === y);
    };

    // Ajout des arêtes liées aux tyroliennes.
    carte.rivieres.forEach((riviere: Riviere) => {
        const embouchureCase: Case | undefined = carte.cases.find(c => c.id === `${riviere.embouchure.x}-${riviere.embouchure.y}`);
        if (!embouchureCase) return;
        const estVersOcean = embouchureCase.type === "ocean";
        let cheminComplet: Position[] = [...riviere.parcours];
        const extension = carte.rivieres.find(r => 
            r !== riviere && r.parcours.some(p => p.x === riviere.embouchure.x && p.y === riviere.embouchure.y)
        );
        if (!estVersOcean) {
            cheminComplet.push(riviere.embouchure);
            if (extension) {
                const idx = extension.parcours.findIndex(p => p.x === riviere.embouchure.x && p.y === riviere.embouchure.y);
                const suite = extension.parcours.slice(idx + 1, idx + 4);
                cheminComplet.push(...suite);
            }
        } else {
        }
        for (let i = 0; i < cheminComplet.length; i++) {
            const depart = cheminComplet[i];
            if (estCastor(depart.x, depart.y)) continue;
            const noeudDepart = graphe.find(g => g.noeud.x === depart.x && g.noeud.y === depart.y);
            if (!noeudDepart) continue;
            let destination: Position | null = null;
            for (let j = 1; j <= 3; j++) {
                const indexCible = i + j;
                if (indexCible >= cheminComplet.length) {
                    destination = cheminComplet[cheminComplet.length - 1];
                    break;
                }
                const caseActuelle = cheminComplet[indexCible];
                if (estCastor(caseActuelle.x, caseActuelle.y)) {
                    destination = caseActuelle;
                    break;
                }
                if (j === 3) {
                    destination = caseActuelle;
                }
            }
            if (destination && (destination.x !== depart.x || destination.y !== depart.y)) {
                noeudDepart.voisins.push({ x: destination.x, y: destination.y });
                const caseVisu = carte.cases.find(c => c.id === `${depart.x}-${depart.y}`);
                if (caseVisu) {
                    caseVisu.riviere.nombre++;
                    caseVisu.riviere.sorties.push({ x: destination.x, y: destination.y });
                }
            }
        }
    });

    // Retire les arêtes qui vont vers les joueurs, pour éviter qu'ils empruntent la même case.
    // Ça pose des problèmes pour le bot, qui au début de la partie ne peut pas trouver de plus court chemin si le nœud d'arrivée n'est pas accessible.
    // ^ Probablement besoin d'utiliser les cases adjacentes pour que le bot se déplace quand même.
    let positionsJoueurs: Position[]
    if (equipe) {
        if (tour === 1) { // C'est à l'équipe bio de jouer
            positionsJoueurs = [joueurInfo.position, joueurInfo2.position];
            // Le pion info est sur une résidence
            if (joueurInfo.position.x === carte.residenceInfo.x && joueurInfo.position.y === carte.residenceInfo.y ||
                joueurInfo.position.x === carte.residenceBio.x && joueurInfo.position.y === carte.residenceBio.y) {
                    positionsJoueurs = [joueurInfo2.position];
                }
            // Le pion info2 est sur une résidence 
            if (joueurInfo2.position.x === carte.residenceInfo.x && joueurInfo2.position.y === carte.residenceInfo.y ||
                joueurInfo2.position.x === carte.residenceBio.x && joueurInfo2.position.y === carte.residenceBio.y) {
                    positionsJoueurs = [joueurInfo.position];
            } 
            // Les 2 pions info sont sur une résidence
            if ((joueurInfo.position.x === carte.residenceInfo.x && joueurInfo.position.y === carte.residenceInfo.y ||
                joueurInfo.position.x === carte.residenceBio.x && joueurInfo.position.y === carte.residenceBio.y)
                &&
                (joueurInfo2.position.x === carte.residenceInfo.x && joueurInfo2.position.y === carte.residenceInfo.y ||
                joueurInfo2.position.x === carte.residenceBio.x && joueurInfo2.position.y === carte.residenceBio.y)) {
                    positionsJoueurs = [];
            }
        }else {
            positionsJoueurs = [joueurBio.position, joueurBio2.position];
            // Le pion bio est sur une résidence
            if (joueurBio.position.x === carte.residenceBio.x && joueurBio.position.y === carte.residenceBio.y ||
                joueurBio.position.x === carte.residenceInfo.x && joueurBio.position.y === carte.residenceInfo.y) {
                positionsJoueurs = [joueurBio2.position];
            }
            // le pion bio2 est sur une résidence
            if (joueurBio2.position.x === carte.residenceBio.x && joueurBio2.position.y === carte.residenceBio.y ||
                joueurBio2.position.x === carte.residenceInfo.x && joueurBio2.position.y === carte.residenceInfo.y) {
                positionsJoueurs = [joueurBio.position];
            }
            // Les 2 pions bio sont sur une résidences
            if ((joueurBio.position.x === carte.residenceBio.x && joueurBio.position.y === carte.residenceBio.y ||
                joueurBio.position.x === carte.residenceInfo.x && joueurBio.position.y === carte.residenceInfo.y) 
                &&
                (joueurBio2.position.x === carte.residenceBio.x && joueurBio2.position.y === carte.residenceBio.y ||
                joueurBio2.position.x === carte.residenceInfo.x && joueurBio2.position.y === carte.residenceInfo.y)) {
                positionsJoueurs = [];
            }
        }
    }else {
        positionsJoueurs = [joueurInfo.position, joueurBio.position];
    }

    // Zone des surveillants
    const zonesInterdites = new Set<string>();
    surveillants.forEach(s => {
        zonesInterdites.add(`${s.x}-${s.y}`);
        const i = s.x;
        const j = s.y;
        const voisinsSurveillant: number[][] = (j % 2 === 1) 
            ? [[i, j - 1], [i + 1, j - 1], [i - 1, j], [i + 1, j], [i, j + 1], [i + 1, j + 1]] 
            : [[i - 1, j - 1], [i, j - 1], [i - 1, j], [i + 1, j], [i - 1, j + 1], [i, j + 1]];
        voisinsSurveillant.forEach(([vx, vy]) => {
            zonesInterdites.add(`${vx}-${vy}`);
        });
    });

    for (const arc of graphe) {
        arc.voisins = arc.voisins.filter(voisin => 
            !positionsJoueurs.some(pos => pos.x === voisin.x && pos.y === voisin.y)
        );
        arc.voisins = arc.voisins.filter(voisin => 
            !casse.some(pos => pos.x === voisin.x && pos.y === voisin.y)
        );
        arc.voisins = arc.voisins.filter(voisin => {
            const cle = `${voisin.x}-${voisin.y}`;
            return !zonesInterdites.has(cle);
        });
    }

    carte.tyroliennes.forEach((tyrolienne: Tyrolienne) => {
        const estCassee = casse.some(pos => 
            pos.x === tyrolienne.entree.x && pos.y === tyrolienne.entree.y
        );

        if (estCassee) {
            const arcDepart: Arc | undefined = graphe.find(g =>
                (g.noeud.x === tyrolienne.entree.x) &&
                (g.noeud.y === tyrolienne.entree.y)
            );

            if (arcDepart) {
                arcDepart.voisins = arcDepart.voisins.filter(voisin => 
                    !(voisin.x === tyrolienne.sortie.x && voisin.y === tyrolienne.sortie.y)
                );
            }
        }
    });

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