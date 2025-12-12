// Dépendances
"use client";
import {useEffect, useState} from "react";
import Grille from "./components/Grille";
import {Jeu} from "./components/Jeu";
import {useSearchParams} from "next/navigation";
import {Graphe} from "./components/Graphe"
import {getCarte} from "@/app/actions/getCarte";

let jeton = 0;

export default function Home() {
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");

    const [partie, setPartie] = useState<any>(null);
    const [posInfo, setPosInfo] = useState(null);
    const [posBio, setPosBio] = useState(null);
    const [posJoueur, setPosJoueur] = useState(null);
    const [posEnnemi, setPosEnnemi] = useState(null);
    const [jsonData, setJsonData] = useState(null);

    
    let posJoueurCourant;

    useEffect(() => {
        if (carteId) {
            getCarte(carteId).then(json => {
                if (json && !json.error) {
                    const nouvellePartie = new Jeu(json, 40);
                    setPartie(nouvellePartie);

                    setPosInfo(nouvellePartie.mascotteInfo);
                    setPosBio(nouvellePartie.mascotteBio);
                    setPosJoueur(nouvellePartie.joueur); 
                    setPosEnnemi(nouvellePartie.ennemi);

                    setJsonData(json);
                }
            });
        }
    }, [carteId]);

    if (jeton == 0) posJoueurCourant = posJoueur;
    else posJoueurCourant = posEnnemi;

    if (!partie || !posJoueurCourant) {
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
                    mascotteInfo={partie.position(posInfo)}
                    mascotteBio={partie.position(posBio)}
                    rivieres={partie.rivieres}
                    tyroliennes={partie.tyroliennes}
                    graphe={graphe}
                    posJoueurCourant={posJoueurCourant}
                    deplacement={(position) => {
                        console.log("jeton après : " + jeton);
                        if (graphe.verifier(posJoueurCourant, position)) {
                            if (jeton == 0) {
                                setPosJoueur(position);
                                jeton = 1;
                            }
                            else {
                                setPosEnnemi(position);
                                jeton = 0;
                            }    
                        }
                    }}
                />
            </>
        );
    }
}
