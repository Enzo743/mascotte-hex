// Dépendances
"use client";
import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {getCarte} from "@/app/actions/getCarte";
// Au cas ou
import GrilleEditeur from "../components/editeur/GrilleEditeur";
import {Case, Connexion} from "../components/Structure";
import {Terrain} from "../components/Terrain";


// Version temporaire de page.tsx adaptée pour l'éditeur de niveaux (j'ai enlevé les joueurs, et quelques dépendances qui bloquaient à l'éxecution)
// J'ai aussi enlevé l'appel à Jeu, car on n'en a plus besoin (ici)
// J'ai modifié GrilleEditeur pour qu'il puisse fonctionner avec ces changements
export default function Home() {
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");
    const [jsonData, setJsonData] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (carteId) {
            getCarte(carteId).then(json => {
                if (json && !json.error) {
                    setJsonData(json);
                    setIsLoaded(true);
                }
            });
        }
    }, [carteId]);

    if (!isLoaded) {
        return <div>Chargement de la carte...</div>;
    } else {
        const rayon: number = 60;
        const hexagones: Case[] = Terrain(jsonData, rayon);
        const tyroliennes: Connexion[] = [];
        const rivieres: Connexion[] = [];

        return (
            <>
                {/* Appel de la GrilleEditeur */}
                <GrilleEditeur
                    rayon={rayon}
                    hexagones={hexagones}
                    mascotteInfo={null}
                    mascotteBio={null}
                    rivieres={rivieres}
                    tyroliennes={tyroliennes}
                />
            </>
        );
    }
}
