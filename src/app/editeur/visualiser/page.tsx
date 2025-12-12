"use client";
import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {Graphe} from "../../components/Graphe";
import {getCarte} from "@/app/actions/getCarte";
import Link from "next/link";
import GrilleEditeur from "@/app/components/editeur/GrilleEditeur";
import { Case, Connexion } from "@/app/components/Structure";
import { Terrain } from "@/app/components/Terrain";

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
                <header className={"head"}>
                    <h1 className={"titre-head"}>{`Rendu de la carte "${carteId}"`}</h1>
                </header>
                <main>
                    <div className={"container-fluid editeur"}>
                        <div className={"sidebar-right"}>
                            <div className={"grille2"}>
                                {/* Appel de la GrilleEditeur */}
                                <GrilleEditeur
                                    rayon={rayon}
                                    hexagones={hexagones}
                                    mascotteInfo={null}
                                    mascotteBio={null}
                                    rivieres={rivieres}
                                    tyroliennes={tyroliennes}
                                />
                            </div>
                        </div>
                    </div>
                    <br/>
                    <div className="titre-head">
                        <Link id="btnRevenir" href="/editeur" role="button">Revenir à l'accueil</Link>
                    </div>
                </main>
            </>
        );
    }
}