"use client"

import {useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {getCarte} from "@/app/actions/getCarte";
import {Jeu} from "@/app/components/Jeu";
import Grille from "@/app/components/Grille";
import "../../globals.css";

export default function Page() {
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");

    const [partie, setPartie] = useState<any>(null);
    const [posInfo, setPosInfo] = useState(null);
    const [posBio, setPosBio] = useState(null);
    const [posJoueur, setPosJoueur] = useState(null);

    useEffect(() => {
        if (carteId) {
            getCarte(carteId).then(json => {
                if (json && !json.error) {
                    const nouvellePartie = new Jeu(json, 40);

                    setPartie(nouvellePartie);

                    setPosInfo(nouvellePartie.mascotteInfo);
                    setPosBio(nouvellePartie.mascotteBio);
                    setPosJoueur(nouvellePartie.joueur);
                }
            });
        }
    }, [carteId]);

    if (!partie || !posJoueur) {
        return <div>Chargement de la carte...</div>;
    }

    return (
        <div className={"container-fluid editeur"}>
            {/* Partie de gauche : Sidebar */}
            <div className={"sidebar-left"}>
                <h1>
                    Edition de la carte &#34;{carteId}&#34;
                </h1>
                <p>Contrôles...</p>
            </div>

            {/* Partie de droite : Conteneur vertical (Grille en haut / Messages en bas) */}
            <div className={"sidebar-right"}>
                {/* Zone du jeu */}
                <div className={"grille"}>
                    <Grille
                        rayon={partie.rayon}
                        hexagones={partie.hexagones}
                        joueur={partie.position(posJoueur)}
                        ennemi={partie.position(partie.ennemi)}
                        mascotteInfo={partie.position(posInfo)}
                        mascotteBio={partie.position(posBio)}
                        rivieres={partie.rivieres}
                        tyroliennes={partie.tyroliennes}
                        deplacement={(position) => setPosJoueur(position)}
                    />
                </div>

                {/* Zone des messages pour les tyroliennes et les rivières */}
                <div className={"messages"}>
                    <p>Test des messages</p>
                </div>
            </div>
        </div>
    )
};