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
                    <form className="zoom-form menu-item">
                        <label className="zoom-row">
                            <span className="zoom-icon">
                                <TbZoom size={30}/>
                            </span>

                            <input
                                className="zoom-range"
                                type={"range"}
                                min={20}
                                max={65}
                                step={1}
                                value={rayon}
                                onChange={(e) => setRayon(Number(e.currentTarget.value))}
                            />

                            <span className="zoom-value">{rayon}</span>
                        </label>
                    </form>
                </main>
            </>
        );
    }
}