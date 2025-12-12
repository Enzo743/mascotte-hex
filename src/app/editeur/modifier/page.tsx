"use client"

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {getCarte} from "@/app/actions/getCarte";
import "../../globals.css";
import {LuFlower, LuMountain, LuWaves} from "react-icons/lu";
import Categorie from "@/app/components/editeur/Categorie";
import {IoIosArrowForward} from "react-icons/io";
import {MdOutlineForest} from "react-icons/md";
import {GiBroccoli, GiCarabiner, GiPenguin, GiRiver} from "react-icons/gi";
import {HiOutlineSave} from "react-icons/hi";
import GestionnaireModal from "@/app/components/editeur/GestionnaireModal";
import {Case, Connexion} from "@/app/components/Structure";
import {Terrain} from "@/app/components/Terrain";
import GrilleEditeur from "@/app/components/editeur/GrilleEditeur";
import {TbZoom} from "react-icons/tb";

export default function Page() {
    // Gestion des params présents dans l'URL
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");
    const show = searchParams.get("show");

    const router = useRouter();

    // State relatif à la carte
    const [jsonData, setJsonData] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [rayon, setRayon] = useState(45);

    // State relatif à la gestion des onglets de l'éditeur
    const [estTerrainOuvert, setEstTerrainOuvert] = useState(false);
    const [terrainSelectionne, setTerrainSelectionne] = useState<string | null>(null);
    const [estResidenceOuverte, setEstResidenceOuverte] = useState(false);
    const [residenceSelectionnee, setResidenceSelectionnee] = useState<string | null>(null);
    const [estConnexionsOuverte, setEstConnexionsOuverte] = useState(false);
    const [connexionsSelectionnee, setConnexionsSelectionnee] = useState<string | null>(null);

    // Permet le chargement de la carte
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
            <div className={"container-fluid editeur"}>
                {/* Partie de gauche : Sidebar */}
                <div className={"sidebar-left"}>
                    <h1>
                        Edition de la carte &#34;{carteId}&#34;
                    </h1>

                    {/* Onglet du terrain */}
                    <Categorie
                        icon={IoIosArrowForward} label={"Terrain"}
                        className={`menu-item ${estTerrainOuvert ? "open" : ""}`}
                        onClick={() => setEstTerrainOuvert(!estTerrainOuvert)}/>

                    {/* Contenu présent quand on clique sur l'onglet du terrain */}
                    {estTerrainOuvert && (
                        <div className={"sousCat"}>
                            <Categorie icon={LuFlower} label={"Plaine"}
                                       className={`menu-item ${terrainSelectionne === "plaine" ? "active" : ""}`}
                                       onClick={() => setTerrainSelectionne(terrainSelectionne === "plaine" ? null : "plaine")}/>
                            <Categorie icon={MdOutlineForest} label={"Forêt"}
                                       className={`menu-item ${terrainSelectionne === "foret" ? "active" : ""}`}
                                       onClick={() => setTerrainSelectionne(terrainSelectionne === "foret" ? null : "foret")}/>
                            <Categorie icon={LuMountain} label={"Montagne"}
                                       className={`menu-item ${terrainSelectionne === "montagne" ? "active" : ""}`}
                                       onClick={() => setTerrainSelectionne(terrainSelectionne === "montagne" ? null : "montagne")}/>
                            <Categorie icon={LuWaves} label={"Océan"}
                                       className={`menu-item ${terrainSelectionne === "ocean" ? "active" : ""}`}
                                       onClick={() => setTerrainSelectionne(terrainSelectionne === "ocean" ? null : "ocean")}/>
                        </div>
                    )}

                    {/* Onglet des résidences */}
                    <Categorie icon={IoIosArrowForward} label={"Résidences"}
                               className={`menu-item ${estResidenceOuverte ? "open" : ""}`}
                               onClick={() => setEstResidenceOuverte(!estResidenceOuverte)}/>

                    {/* Contenu présent quand on clique sur l'onglet des résidences */}
                    {estResidenceOuverte && (
                        <div className={"sousCat"}>
                            <Categorie icon={GiPenguin} label={"Résidence des informaticiens"}
                                       className={`menu-item ${residenceSelectionnee === "info" ? "active" : ""}`}
                                       onClick={() => setResidenceSelectionnee(residenceSelectionnee === "info" ? null : "info")}/>
                            <Categorie icon={GiBroccoli} label={"Résidence des biologistes"}
                                       className={`menu-item ${residenceSelectionnee === "bio" ? "active" : ""}`}
                                       onClick={() => setResidenceSelectionnee(residenceSelectionnee === "bio" ? null : "bio")}/>
                        </div>
                    )}

                    {/* Onglet des connexions */}
                    <Categorie icon={IoIosArrowForward} label={"Connexions"}
                               className={`menu-item ${estConnexionsOuverte ? "open" : ""}`}
                               onClick={() => setEstConnexionsOuverte(!estConnexionsOuverte)}/>

                    {/* Contenu présent quand on clique sur l'onglet des connexions */}
                    {estConnexionsOuverte && (
                        <div className={"sousCat"}>
                            <Categorie icon={GiCarabiner} label={"Tyrolienne"}
                                       className={`menu-item ${connexionsSelectionnee === "tyrolienne" ? "active" : ""}`}
                                       onClick={() => setConnexionsSelectionnee(connexionsSelectionnee === "tyrolienne" ? null : "tyrolienne")}/>
                            <Categorie icon={GiRiver} label={"Rivière"}
                                       className={`menu-item ${connexionsSelectionnee === "riviere" ? "active" : ""}`}
                                       onClick={() => setConnexionsSelectionnee(connexionsSelectionnee === "riviere" ? null : "riviere")}/>
                        </div>
                    )}

                    {/* Onglet pour changer de carte */}
                    <Categorie icon={HiOutlineSave} label={"Changer de carte"}
                               className={"menu-item"}
                               onClick={() => router.push(`/editeur/modifier?id=${carteId}&show=true`)}/>

                    {/* Modal qui s'ouvre quand on clique sur l'onglet pour changer de carte */}
                    {show && <GestionnaireModal prefixe={`/editeur/modifier`}
                                                onCloseHref={`/editeur/modifier?id=${carteId}`}/>}

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
                </div>

                {/* Partie de droite : Conteneur vertical (GrilleEditeur en haut / Messages en bas) */}
                <div className={"sidebar-right"}>
                    <div className={"grille"}>
                        <GrilleEditeur
                            rayon={rayon}
                            hexagones={hexagones}
                            mascotteInfo={null}
                            mascotteBio={null}
                            rivieres={rivieres}
                            tyroliennes={tyroliennes}
                        />
                    </div>

                    {/* Zone des messages pour les tyroliennes et les rivières */}
                    <div className={"messages"}>
                        <p>Test des messages</p>
                    </div>
                </div>
            </div>
        )
    }
};