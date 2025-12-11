import { BuildManifest } from "next/dist/server/get-page-files";
import { Case, Connexion } from "./Structure";


// Renvoie true si la case cible est adjacente à la case du joueur
function caseAdjacente({caseCible, coordCaseJoueurCourant}: {caseCible: Case; coordCaseJoueurCourant: [number, number]}) {
    let caseAdjacentes = [];

    /*
    caseAdjacentes.push({"x": coordCaseJoueurCourant.x, "y": coordCaseJoueurCourant.y-1});
    caseAdjacentes.push({"x": coordCaseJoueurCourant.x+1, "y": coordCaseJoueurCourant.y-1});
    caseAdjacentes.push({"x": coordCaseJoueurCourant.x+1, "y": coordCaseJoueurCourant.y});
    caseAdjacentes.push({"x": coordCaseJoueurCourant.x-1, "y": coordCaseJoueurCourant.y});
    caseAdjacentes.push({"x": coordCaseJoueurCourant.x+1, "y": coordCaseJoueurCourant.y-1});
    caseAdjacentes.push({"x": coordCaseJoueurCourant.x+2, "y": coordCaseJoueurCourant.y-1});
    */

    caseAdjacentes.push([coordCaseJoueurCourant[0], coordCaseJoueurCourant[1] - 1]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] + 1, coordCaseJoueurCourant[1] - 1]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] + 1, coordCaseJoueurCourant[1]]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] - 1, coordCaseJoueurCourant[1]]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] + 1, coordCaseJoueurCourant[1] - 1]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] + 2, coordCaseJoueurCourant[1] - 1]);
    for(let i = 0; i<6; i++){
        if (caseAdjacentes[i][0] == caseCible.position.x && caseAdjacentes[i][1] == caseCible.position.y) {
            return true;
        }
    }
    return false;
}

// Renvoie true si il n'y a pas de joueur sur la case cible
function caseLibre({caseCible, coordCaseAutreJoueur}: {caseCible: Case; coordCaseAutreJoueur: [number, number]}) {
    return caseCible.position.x != coordCaseAutreJoueur[0] && caseCible.position.y != coordCaseAutreJoueur[0];
}

/*
Renvoie true si la case cible n'est ni montagne, ni océan, est libre, est adjacente. 
Renvoie false sinon
*/
function caseJouable({caseCible, coordCaseJoueurCourant, coordCaseAutreJoueur}: {caseCible: Case; coordCaseJoueurCourant: [number, number]; coordCaseAutreJoueur: [number, number]}) {
    return caseCible.type != "montagne" && caseCible.type != "ocean" && caseLibre({caseCible, coordCaseAutreJoueur}) && caseAdjacente({caseCible, coordCaseJoueurCourant});
}

// Renvoie le joueur en fonction du premier clique et null sinon 
function premierJoueur({caseCible, joueur, ennemi}: {caseCible: Case; joueur: [number, number]; ennemi: [number, number]}) {
    if(caseAdjacente({caseCible, joueur})) return joueur;
    if(caseAdjacente({caseCible, ennemi})) return ennemi;
    return null;
}

// Renvoie la case d'arrivée si la case cible est une tyrolienne
function estTyrolienne({tabTyroliennes, caseCible}: {tabTyroliennes: Connexion[]; caseCible: Case}) {
    let tabTyroliennes1 = [];
    let caseArrivee = null;

    for (let i = 0; i < tabTyroliennes.length; i++) {
        tabTyroliennes1.push({"départ": tabTyroliennes[i].tuiles[0], "arrivée": tabTyroliennes[i].tuiles[1]});

        // Si la case cible correspond à la case de départ d'une tyrolienne
        if (tabTyroliennes1[i].départ[0] == caseCible.position.x && tabTyroliennes1[i].départ[1] == caseCible.position.y) {
            caseArrivee = tabTyroliennes1[i].arrivée;
        }
    }

    return caseArrivee;
}


