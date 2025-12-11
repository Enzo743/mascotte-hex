import { Case, Connexion } from "./Structure";

// Renvoie true si la case cible est adjacente à la case du joueur
function caseAdjacente({caseCible, caseJoueurCourant}: {caseCible: Case; caseJoueurCourant: Case}) {
    let caseAdjacentes = [];

    
    caseAdjacentes.push({"x": caseJoueurCourant.position.x, "y": caseJoueurCourant.position.y-1});
    caseAdjacentes.push({"x": caseJoueurCourant.position.x+1, "y": caseJoueurCourant.position.y-1});
    caseAdjacentes.push({"x": caseJoueurCourant.position.x+1, "y": caseJoueurCourant.position.y});
    caseAdjacentes.push({"x": caseJoueurCourant.position.x-1, "y": caseJoueurCourant.position.y});
    caseAdjacentes.push({"x": caseJoueurCourant.position.x+1, "y": caseJoueurCourant.position.y-1});
    caseAdjacentes.push({"x": caseJoueurCourant.position.x+2, "y": caseJoueurCourant.position.y-1});
    
    /*
    caseAdjacentes.push([coordCaseJoueurCourant[0], coordCaseJoueurCourant[1] - 1]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] + 1, coordCaseJoueurCourant[1] - 1]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] + 1, coordCaseJoueurCourant[1]]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] - 1, coordCaseJoueurCourant[1]]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] + 1, coordCaseJoueurCourant[1] - 1]);
    caseAdjacentes.push([coordCaseJoueurCourant[0] + 2, coordCaseJoueurCourant[1] - 1]);
    */
    for(let i = 0; i<6; i++){
        if (caseAdjacentes[i].x == caseCible.position.x && caseAdjacentes[i].y == caseCible.position.y) {
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
export function premierJoueur({caseCible, joueur, ennemi}: {caseCible: Case; joueur: Case; ennemi: Case}) {
    let caseJoueurCourant = joueur;
    if(caseAdjacente({caseCible, caseJoueurCourant})) return joueur;
    caseJoueurCourant = ennemi
    if(caseAdjacente({caseCible, caseJoueurCourant})) return ennemi;
    return caseCible;
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

// Renvoie un message de victoire si une mascotte est dans la résidence adverse
function victoire({residenceInfo, residenceBio, mascotteInfo, mascotteBio}: {residenceInfo: Case; residenceBio: Case; mascotteInfo: Case; mascotteBio: Case}) {
    if (mascotteBio.position.x == residenceInfo.position.x && mascotteBio.position.y == residenceInfo.position.y) {
        return "Victoire des informaticiens !";
    }
    if (mascotteInfo.position.x == residenceBio.position.x && mascotteInfo.position.y == residenceBio.position.y) {
        return "Victoire des biologistes !";
    }
    return "Partie en cours";
}
