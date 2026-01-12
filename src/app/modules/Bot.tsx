// Dépendances
import { Arc, DifficulteIA, Noeud, File } from "./Interfaces";

/*
=== plusCourtChemin ===
Calcule le chemin le plus court dans un graphe orienté entre un nœud de départ et un nœud d'arrivée en utilisant la recherche en largeur (BFS). 
L'algo a plusieurs niveaux de difficultés, chacun avec des variations, mis ) part le niveau "extreme" (en théorie parfait)
Problème : les variations sont tellement mineures que la difficulté stupide est parfois plus intelligente que moi (je le prends mal)
Il faudrait faire des traitements différents que BFS pour les niveaux stupide et facile
*/

export function plusCourtChemin(graphe: Arc[], depart: Noeud, arrive: Noeud, difficulte: DifficulteIA): Noeud[] | null {
    const file = new File();
    const visite = new Set<string>(); // Retient les noeuds déjà visités (avec un identifiant unique constitué de leurs coordonnées)
    const precedent = new Map<string, Noeud>(); // Retient les noeuds précédents pour pouvoir reconstituer le chemin.
    
    file.enfiler(depart);
    visite.add(`${depart.x},${depart.y}`);

    const obtenirVoisins = (arcCourant: Arc, difficulte: DifficulteIA): Noeud[] => { // Selectionne les voisins d'un noeud, plus ou moins bien en fonction de la difficulté
        const voisins = [...arcCourant.voisins];

        const chaos: Record<DifficulteIA, number> = { // Plus la difficulté est basse, plus l'aléatoire est haut
            extreme: 0,
            difficile: 0.1,
            moyen: 0.3,
            facile: 0.6,
            stupide: 1,
        };

        return voisins.sort(() => (Math.random() - 0.5) * chaos[difficulte]);
    };

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

        const voisins = obtenirVoisins(arcCourant, difficulte);

        if (voisins)
        for (const voisin of voisins) {
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

export function cheminRandom(graphe: Arc[], depart: Noeud): Noeud | null {
    const arcCourant = graphe.find(a => a.noeud.x === depart.x && a.noeud.y === depart.y);
    if (!arcCourant || arcCourant.voisins.length == 0) {
        return null;
    }
    return arcCourant.voisins[Math.floor(Math.random() * arcCourant.voisins.length)];
}