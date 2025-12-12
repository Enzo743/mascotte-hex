"use client";
import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {getCarte} from "@/app/actions/getCarte";
import Link from "next/link";
import GrilleEditeur from "@/app/components/editeur/GrilleEditeur";
import {Case, Connexion} from "@/app/components/Structure";
import {Terrain} from "@/app/components/Terrain";
import {TbZoom} from "react-icons/tb";

export default function Home() {
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");
    const [jsonData, setJsonData] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [rayon, setRayon] = useState(45);

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
        const hexagones: Case[] = Terrain(jsonData, rayon);
        const tyroliennes: Connexion[] = jsonData.connexions.filter(c => c.type === "tyrolienne");
        const rivieres: Connexion[] = jsonData.connexions.filter(c => c.type === "riviere");

        return (
            <>
                <header className={"head-compact"}>
                    <h1 className={"titre-head"}>{`Rendu de la carte "${carteId}"`}</h1>
                </header>
                <main>
                    <div className={"container-fluid editeur"}>
                        <div className={"sidebar-right"}>
                            <div className={"grille2"}>
                                <div className={"contenu-visu"}>
                                    {/* Appel de la GrilleEditeur */}
                                    <GrilleEditeur
                                        rayon={rayon}
                                        hexagones={hexagones}
                                        mascotteInfo={null}
                                        mascotteBio={null}
                                        rivieres={rivieres}
                                        tyroliennes={tyroliennes}
                                        onClick={(hex) => {}}
                                    />
                                    <br/>
                                    <Link id="btnRevenir" href="/editeur" role="button">Revenir à l'accueil</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="zoom">
                        <div className="zoom-icon">
                            <TbZoom size={24} />
                        </div>

                        <input
                            className="zoom-range"
                            type={"range"}
                            min={20}
                            max={65}
                            step={1}
                            value={rayon}
                            onChange={(e) => setRayon(Number(e.currentTarget.value))}
                        />

                        <div className="zoom-value">
                            {rayon}
                        </div>
                    </div>
                </main>
            </>
        );
    }
}