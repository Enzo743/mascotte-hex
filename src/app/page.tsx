// Dépendances
"use client";
import {useEffect, useState} from "react";
import Grille from "./components/Grille";
import {Jeu} from "./components/Jeu";
import {useSearchParams} from "next/navigation";

async function getCarte(nom: string | null) {
    const response = await fetch(`/api/cartes/get/${nom}`, {
        method: "GET",
    });

    return await response.json();
}

export default function Home() {
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
        <>
            {/* Appel de la Grille */}
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
        </>
    );
}