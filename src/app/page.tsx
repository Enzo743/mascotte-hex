// Dépendances
"use client";
import {useEffect, useState} from "react";
import Grille from "./components/Grille";
import {Jeu} from "./components/Jeu";
import {useSearchParams} from "next/navigation";
import {Graphe} from "./components/Graphe"
import {getCarte} from "@/app/actions/getCarte";

let jeton = 0;

let partieFinie = false;

let mascotteInfoVolle = false;
let mascotteBioVolle = false;

let tabJoueurs = [];

export default function Home() {
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");

    const [partie, setPartie] = useState<any>(null);

    const [posMascotteInfo, setPosMascotteInfo] = useState(null);
    const [posMascotteBio, setPosMascotteBio] = useState(null);

    const [posResidenceInfo, setPosResidenceInfo] = useState(null);
    const [posResidenceBio, setPosResidenceBio] = useState(null);

    const [posJoueur, setPosJoueur] = useState(null);
    const [posEnnemi, setPosEnnemi] = useState(null);

    const [jsonData, setJsonData] = useState(null);

    let posJoueurCourant = [-1, -1];
 

    useEffect(() => {
        if (carteId) {
            getCarte(carteId).then(json => {
                if (json && !json.error) {
                    const nouvellePartie = new Jeu(json, 40);
                    setPartie(nouvellePartie);

                    setPosMascotteInfo(nouvellePartie.mascotteInfo);
                    setPosMascotteBio(nouvellePartie.mascotteBio);

                    setPosResidenceInfo(nouvellePartie.mascotteInfo);
                    setPosResidenceBio(nouvellePartie.mascotteBio);

                    setPosJoueur(nouvellePartie.joueur); 
                    setPosEnnemi(nouvellePartie.ennemi);

                    setJsonData(json);
                }
            });
        }
    }, [carteId]);

    tabJoueurs = [posJoueur, posEnnemi];

    if (jeton == 1) posJoueurCourant = posJoueur;
    if (jeton == 2) posJoueurCourant = posEnnemi;

    if (!partie) {
        return <div>Chargement de la carte...</div>;
    } else {
        const graphe = new Graphe(jsonData);
        graphe.actualiserGraphe();
        return (
            <>
                {/* Appel de la Grille */}
                <Grille
                    rayon={partie.rayon}
                    hexagones={partie.hexagones}
                    joueur={partie.position(posJoueur)} 
                    ennemi={partie.position(posEnnemi)} 
                    mascotteInfo={partie.position(posMascotteInfo)}
                    mascotteBio={partie.position(posMascotteBio)}
                    residenceInfo={partie.position(posResidenceInfo)}
                    residenceBio={partie.position(posResidenceBio)}
                    rivieres={partie.rivieres}
                    tyroliennes={partie.tyroliennes}
                    graphe={graphe}
                    jeton={jeton}
                    posJoueurCourant={posJoueurCourant}
                    tabJoueurs={tabJoueurs}
                    deplacement={(position) => {
                        if (!partieFinie) {

                            // Premier tour et on ne sait pas quel joueur commence
                            if (jeton == 0) {
                                if (graphe.verifier(posJoueur, position)) {
                                    console.log("Vérif");
                                    jeton = 1;
                                    posJoueurCourant = posJoueur;
                                }
                                if (graphe.verifier(posEnnemi, position)) {
                                    jeton = 2;
                                    posJoueurCourant = posEnnemi;
                                }
                            }
                            
                            if (graphe.verifier(posJoueurCourant, position)) {

                                if (jeton == 1) {
                                    setPosJoueur(position);

                                    if (position[0] == posMascotteBio[0] && position[1] == posMascotteBio[1]) mascotteBioVolle = true;
                                    if (mascotteBioVolle) {
                                        setPosMascotteBio(position);

                                        if (position[0] == posResidenceInfo[0] && position[1] == posResidenceInfo[1]) partieFinie = true;
                                    }

                                    jeton = 2;
                                }
                                else {
                                    setPosEnnemi(position);
                                    
                                    if (position[0] == posMascotteInfo[0] && position[1] == posMascotteInfo[1]) mascotteInfoVolle = true;
                                    if (mascotteInfoVolle) {
                                        setPosMascotteInfo(position);

                                        if (position[0] == posResidenceBio[0] && position[1] == posResidenceBio[1]) partieFinie = true;
                                    }

                                    jeton = 1;
                                }
                            }
                        }
                    }}
                />
            </>
        );
    }
}
