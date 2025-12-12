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
import {setTuiles} from "@/app/actions/setTuiles";
import LogTextarea, {LogMessage} from "@/app/components/editeur/LogTextarea";

export default function Page() {
    // Gestion des params présents dans l'URL
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");
    const show = searchParams.get("show");

    const router = useRouter();

    // State relatif à la carte
    const [isLoaded, setIsLoaded] = useState(false);
    const [rayon, setRayon] = useState(45);
    const [hexagones, setHexagones] = useState<Case[]>([]);
    const [tyroliennes, setTyroliennes] = useState<Connexion[]>([]);
    const [rivieres, setRivieres] = useState<Connexion[]>([]);
    const [posInfo, setPosInfo] = useState(null);
    const [posBio, setPosBio] = useState(null);

    // State relatif à la gestion des onglets de l'éditeur
    const [estTerrainOuvert, setEstTerrainOuvert] = useState(false);
    const [terrainSelectionne, setTerrainSelectionne] = useState<string | null>(null);
    const [estResidenceOuverte, setEstResidenceOuverte] = useState(false);
    const [residenceSelectionnee, setResidenceSelectionnee] = useState<string | null>(null);
    const [estConnexionsOuverte, setEstConnexionsOuverte] = useState(false);
    const [connexionsSelectionnee, setConnexionsSelectionnee] = useState<string | null>(null);
    const [messages, setMessages] = useState<LogMessage[]>([]);

    const pushMsg = (text: string, level: LogMessage["level"] = "ok") => {
        setMessages((prev) =>
            [...prev, {id: crypto.randomUUID(), text, level}].slice(-50)
        );
    };

    // Fonction qui permet d'ouvrir / fermer les onglets de la sidebar, et d'avoir la sélection des "objets"
    const selectionner = (
        mode: "terrain" | "residence" | "connexion",
        valeur: string | null
    ) => {
        if (mode === "terrain") {
            setTerrainSelectionne(valeur);
            setResidenceSelectionnee(null);
            setConnexionsSelectionnee(null);

            setEstTerrainOuvert(true);
            setEstResidenceOuverte(false);
            setEstConnexionsOuverte(false);
        }

        if (mode === "residence") {
            setResidenceSelectionnee(valeur);
            setTerrainSelectionne(null);
            setConnexionsSelectionnee(null);

            setEstResidenceOuverte(true);
            setEstTerrainOuvert(false);
            setEstConnexionsOuverte(false);
        }

        if (mode === "connexion") {
            setConnexionsSelectionnee(valeur);
            setTerrainSelectionne(null);
            setResidenceSelectionnee(null);

            setEstConnexionsOuverte(true);
            setEstTerrainOuvert(false);
            setEstResidenceOuverte(false);
        }
    };

    // Fonction qui permet de recharger la carte avec les changements effectués
    const appliquerCarte = (json, rayon) => {
        setIsLoaded(true);

        const nextHexagones = Terrain(json, rayon) as Case[];
        setHexagones(nextHexagones);

        const info = json.résidences?.residenceInfo ?? null;
        const bio = json.résidences?.residenceBio ?? null;

        // On transforme [x,y] -> "x-y" pour comparer simplement
        const infoId = info ? `${info[0]}-${info[1]}` : null;
        const bioId = bio ? `${bio[0]}-${bio[1]}` : null;

        setPosInfo(infoId ? (nextHexagones.find(h => h.id === infoId) ?? null) : null);
        setPosBio(bioId ? (nextHexagones.find(h => h.id === bioId) ?? null) : null);

        const connexions = json.connexions ?? [];
        setTyroliennes(connexions.filter((c: Connexion) => c.type === "tyrolienne"));
        setRivieres(connexions.filter((c: Connexion) => c.type === "riviere"));
    };

    // Permet le chargement de la carte
    useEffect(() => {
        if (!carteId) return;

        getCarte(carteId).then((json: any) => {
            if (json && !json.error) {
                appliquerCarte(json, rayon);
            }
        });
    }, [carteId, rayon]);

    if (!isLoaded) {
        return <div>Chargement de la carte...</div>;
    } else {
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
                                       onClick={() => selectionner("terrain", terrainSelectionne === "plaine" ? null : "plaine")}/>
                            <Categorie icon={MdOutlineForest} label={"Forêt"}
                                       className={`menu-item ${terrainSelectionne === "foret" ? "active" : ""}`}
                                       onClick={() => selectionner("terrain", terrainSelectionne === "foret" ? null : "foret")}/>
                            <Categorie icon={LuMountain} label={"Montagne"}
                                       className={`menu-item ${terrainSelectionne === "montagne" ? "active" : ""}`}
                                       onClick={() => selectionner("terrain", terrainSelectionne === "montagne" ? null : "montagne")}/>
                            <Categorie icon={LuWaves} label={"Océan"}
                                       className={`menu-item ${terrainSelectionne === "ocean" ? "active" : ""}`}
                                       onClick={() => selectionner("terrain", terrainSelectionne === "ocean" ? null : "ocean")}/>
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
                                       onClick={() => selectionner("residence", residenceSelectionnee === "info" ? null : "info")}/>
                            <Categorie icon={GiBroccoli} label={"Résidence des biologistes"}
                                       className={`menu-item ${residenceSelectionnee === "bio" ? "active" : ""}`}
                                       onClick={() => selectionner("residence", residenceSelectionnee === "bio" ? null : "bio")}/>
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
                                       onClick={() => selectionner("connexion", connexionsSelectionnee === "tyrolienne" ? null : "tyrolienne")}/>
                            <Categorie icon={GiRiver} label={"Rivière"}
                                       className={`menu-item ${connexionsSelectionnee === "riviere" ? "active" : ""}`}
                                       onClick={() => selectionner("connexion", connexionsSelectionnee === "riviere" ? null : "riviere")}/>
                        </div>
                    )}

                    {/* Onglet pour changer de carte */}
                    <Categorie icon={HiOutlineSave} label={"Changer de carte"}
                               className={"menu-item"}
                               onClick={() => router.push(`/editeur/modifier?id=${carteId}&show=true`)}/>

                    {/* Modal qui s'ouvre quand on clique sur l'onglet pour changer de carte */}
                    {show && <GestionnaireModal prefixe={`/editeur/modifier`}
                                                onCloseHref={`/editeur/modifier?id=${carteId}`}/>}

                    {/* Slider pour gérer le zoom de la carte */}
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
                            mascotteInfo={posInfo}
                            mascotteBio={posBio}
                            rivieres={rivieres}
                            tyroliennes={tyroliennes}
                            onClick={(hex) => {
                                let coordonnees_hex = hex.id.split("-");
                                let x = Number(coordonnees_hex[0]);
                                let y = Number(coordonnees_hex[1]);
                                console.log("x = " + x);
                                console.log("y = " + y);
                                const log = document.querySelector("textarea[name='log']");
                                const date = new Date().toLocaleString().toString();

                                // On gère chacun des cas possibles d'onglets
                                if (terrainSelectionne === "plaine") {
                                    setTuiles(JSON.stringify({
                                        "nom": `${carteId}`,
                                        "plaine": [x, y]
                                    })).then(r => {
                                        if (r.status === "success") {
                                            getCarte(carteId).then((json: any) => {
                                                if (json && !json.error) {
                                                    appliquerCarte(json, rayon);
                                                    pushMsg("[" + date + "] - Ajout d'un terrain 'Plaine' en position (" + x + ", " + y + ")", "ok");
                                                }
                                            });
                                        } else {
                                            pushMsg("[" + date + "] - Erreur lors de l'ajout d'un terrain 'Plaine' en position (" + x + ", " + y + ")", "erreur");
                                        }
                                    });
                                } else if (terrainSelectionne === "foret") {
                                    setTuiles(JSON.stringify({
                                        "nom": `${carteId}`,
                                        "foret": [x, y]
                                    })).then(r => {
                                        if (r.status === "success") {
                                            getCarte(carteId).then((json: any) => {
                                                if (json && !json.error) {
                                                    appliquerCarte(json, rayon);
                                                    pushMsg("[" + date + "] - Ajout d'un terrain 'Forêt' en position (" + x + ", " + y + ")", "ok");
                                                }
                                            });
                                        } else {
                                            pushMsg("[" + date + "] - Erreur lors de l'ajout d'un terrain 'Forêt' en position (" + x + ", " + y + ")", "erreur");
                                        }
                                    });
                                } else if (terrainSelectionne === "montagne") {
                                    setTuiles(JSON.stringify({
                                        "nom": `${carteId}`,
                                        "montagne": [x, y]
                                    })).then(r => {
                                        if (r.status === "success") {
                                            getCarte(carteId).then((json: any) => {
                                                if (json && !json.error) {
                                                    appliquerCarte(json, rayon);
                                                    pushMsg("[" + date + "] - Ajout d'un terrain 'Montagne' en position (" + x + ", " + y + ")", "ok");
                                                }
                                            });
                                        } else {
                                            pushMsg("[" + date + "] - Erreur lors de l'ajout d'un terrain 'Montagne' en position (" + x + ", " + y + ")", "erreur");
                                        }
                                    });
                                } else if (terrainSelectionne === "ocean") {
                                    setTuiles(JSON.stringify({
                                        "nom": `${carteId}`,
                                        "ocean": [x, y]
                                    })).then(r => {
                                        if (r.status === "success") {
                                            getCarte(carteId).then((json: any) => {
                                                if (json && !json.error) {
                                                    appliquerCarte(json, rayon);
                                                    pushMsg("[" + date + "] - Ajout d'un terrain 'Océan' en position (" + x + ", " + y + ")", "ok");
                                                }
                                            });
                                        } else {
                                            pushMsg("[" + date + "] - Erreur lors de l'ajout d'un terrain 'Océan' en position (" + x + ", " + y + ")", "erreur");
                                        }
                                    });
                                } else if (residenceSelectionnee === "info") {
                                    setTuiles(JSON.stringify({
                                        "nom": `${carteId}`,
                                        "residenceInfo": [x, y]
                                    })).then(r => {
                                        if (r.status === "success") {
                                            getCarte(carteId).then((json: any) => {
                                                if (json && !json.error) {
                                                    appliquerCarte(json, rayon);
                                                    pushMsg("[" + date + "] - Ajout d'une résidence d'informaticien en position (" + x + ", " + y + ")", "ok");
                                                }
                                            });
                                        } else {
                                            pushMsg("[" + date + "] - Erreur lors de l'ajout d'une résidence d'informaticien en position (" + x + ", " + y + ")", "erreur");
                                        }
                                    });
                                } else if (residenceSelectionnee === "bio") {
                                    setTuiles(JSON.stringify({
                                        "nom": `${carteId}`,
                                        "residenceBio": [x, y]
                                    })).then(r => {
                                        if (r.status === "success") {
                                            getCarte(carteId).then((json: any) => {
                                                if (json && !json.error) {
                                                    appliquerCarte(json, rayon);
                                                    pushMsg("[" + date + "] - Ajout d'une résidence de biologiste en position (" + x + ", " + y + ")", "ok");
                                                }
                                            });
                                        } else {
                                            pushMsg("[" + date + "] - Erreur lors de l'ajout d'une résidence de biologiste en position (" + x + ", " + y + ")", "erreur");
                                        }
                                    });
                                } else if (connexionsSelectionnee === "tyrolienne") {
                                    console.log("tyrolienne");
                                } else if (connexionsSelectionnee === "riviere") {
                                    console.log("riviere");
                                }
                            }}
                        />
                    </div>

                    {/* Zone des messages pour les logs de chaque changement dans l'éditeur */}
                    <div className={"messages"}>
                        <LogTextarea
                            messages={messages}
                            maxVisible={5}
                            rows={6}
                        />
                    </div>
                </div>
            </div>
        )
    }
};