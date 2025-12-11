import { Case, Carte, Connexion, Voisins } from "./Structure";
import { Terrain } from "./Terrain";

/* 
Implémentation d'un graphe représentant tous les chemins possibles
Sera utile pour les règles de déplacement ainsi que pour l'algorithme du bot

C'est donc un graphe orienté, chaque noeud à une liste de noeud adjacents (possiblement vide)
D'abord les arrêtes entre les types de terrains sont définies
Ensuite les arrêtes entre les départs et arrivés des tyroliennes
Enfin les arrêtes des rivières, avec leurs règles associées

Code peu lisible, j'y retournerais pour l'optimiser, d'autant plus qu'un appel à la fonction Terrain me parait un peu exessif
(Utilisation en trop de ressources)

Egalement corriger un bug d'adjacence avec les rivières (et code tout autant peu lisible)
*/
export class Graphe {
    carte: Carte;
    hexagones: Case[];
    rivieres: Connexion[];
    tyroliennes: Connexion[];
    graphe: Voisins[];

    constructor(carte: Carte) {
        this.carte = carte;
        this.hexagones = Terrain(carte, 10);
        this.rivieres = carte.connexions.filter(c => c.type === "riviere");
        this.tyroliennes = carte.connexions.filter(c => c.type === "tyrolienne");
        this.graphe = [];
    }

    actualiserGraphe() {
        for (let i = 0; i < this.carte.grille.colonnes; i++) {
            for (let j = 0; j < this.carte.grille.lignes; j++) {  
                const temp : Voisins = {position: {x: i, y: j}, voisins: []};
                const hexagone = this.hexagones.find(h => h.id === `${i}-${j}`);
                if (hexagone && hexagone.type !== "ocean" && hexagone.type !== "montagne") {
                    const voisins : number[][] = (j%2 == 1) ? [[i,j-1],[i+1,j-1],[i-1,j],[i+1,j],[i,j+1],[i+1,j+1]] : [[i-1,j-1],[i,j-1],[i-1,j],[i+1,j],[i-1,j+1],[i,j+1]];
                    voisins.forEach((voisin) => {
                        const truc = this.hexagones.find(h => h.id === `${voisin[0]}-${voisin[1]}`);
                        if (truc && truc.type !== "ocean" && truc.type !== "montagne") {
                            temp.voisins.push(voisin);
                        }
                    });
                }
                this.graphe.push(temp);
            }
        }

        this.tyroliennes.forEach((tyrolienne) => {
            const truc = this.graphe.find(obj => (obj.position.x === tyrolienne.tuiles[0][0]) && (obj.position.y === tyrolienne.tuiles[0][1]));
            if (truc) {
                truc.voisins.push([tyrolienne.tuiles[1][0], tyrolienne.tuiles[1][1]]);
            }
        });

        this.rivieres.forEach((riviere) => {
            for (let i = 0; i < riviere.tuiles.length - 1; i++) {
                const tuile = riviere.tuiles[i];
                const truc = this.graphe.find(obj => (obj.position.x === tuile[0]) && (obj.position.y === tuile[1]));
                
                if (truc) {
                    for (let j = 2; j <= 3; j++) {
                        const prochain = i + j;
                        if (prochain < riviere.tuiles.length) {
                            const nextTile = riviere.tuiles[prochain];
                            truc.voisins.push([nextTile[0], nextTile[1]]);
                        }
                    }
                }
            }
        });
    }

    afficherGraphe() {
        this.graphe.forEach((voisin) => {
            console.log(voisin);   
        });
    }

    verifier(actuel: [number, number], futur: [number, number]) {
        const truc = this.graphe.find(obj => (obj.position.x === actuel[0]) && (obj.position.y === actuel[1]));
        if (truc) {
            return truc.voisins.some(voisin => 
                voisin[0] === futur[0] && voisin[1] === futur[1]
            );
        }
        return false;
    }

}