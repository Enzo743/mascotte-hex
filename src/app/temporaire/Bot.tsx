import { Arc, Noeud, Position } from "./Interfaces";

/*
=== File ===
Implémentation d'une classe représentant une file de positions.
*/
class File {
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

/*
=== plusCourtChemin ===
Calcule le chemin le plus court dans un graphe orienté entre un nœud de départ et un nœud d'arrivée en utilisant la recherche en largeur (BFS). 
Fonctionne dans l'état actuel, mais peut ne pas être le plus adapté pour un bot, l'objectif est de s'entraîner, pas de se faire massacrer par l'adversaire.

Todo : Rendre le bot moins intelligent, avec plusieurs niveaux de difficulté ?
*/
export function plusCourtChemin(graphe: Arc[], depart: Noeud, arrive: Noeud): Noeud[] | null {
    const file = new File();
    const visite = new Set<string>(); // Retient les nœuds déjà visités (avec un identifiant unique constitué de leurs coordonnées).
    const precedent = new Map<string, Noeud>(); // Retient les nœuds précédents pour pouvoir reconstituer le chemin.

    file.enfiler(depart);
    visite.add(`${depart.x},${depart.y}`);

    while (!file.estVide()) {
        const courant = file.defiler()!;
        if (courant.x === arrive.x && courant.y === arrive.y) {
            const chemin: Noeud[] = [];
            let temp: Noeud | undefined = courant;
            while (temp) {
                chemin.unshift(temp);
                temp = precedent.get(`${temp.x},${temp.y}`);
            }
            return chemin;
        }

        const arcCourant = graphe.find(a => a.noeud.x === courant.x && a.noeud.y === courant.y);
        if (!arcCourant) continue;

        for (const voisin of arcCourant.voisins) {
            const key = `${voisin.x},${voisin.y}`;
            if (!visite.has(key)) {
                visite.add(key);
                precedent.set(key, courant);
                file.enfiler(voisin);
            }
        }
    }

    // Si aucun chemin n'est trouvé, la fonction renvoie null.
    return null;
}