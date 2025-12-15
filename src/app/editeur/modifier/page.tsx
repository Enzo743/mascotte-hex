"use client"

import {ReadonlyURLSearchParams, useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import "../../globals.css";
import GrilleEditeur from "@/app/components/editeur/GrilleEditeur";
import LogTextarea from "@/app/components/editeur/LogTextarea";
import {Graphe} from "@/app/components/Graphe";
import GestionnaireModal from "@/app/components/editeur/modals/GestionnaireModal";
import Sidebar from "@/app/components/editeur/Sidebar";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {useEditeurCarte} from "@/app/hooks/useEditeurCarte";
import {useClicHandler} from "@/app/hooks/useClicHandler";
import {useHistorique} from "@/app/hooks/useHistorique";

export default function Page() {
    // Gestion des params présents dans l'URL
    const searchParams: ReadonlyURLSearchParams = useSearchParams();
    const carteId: string | null = searchParams.get("id");
    const show: string | null = searchParams.get("show");
    const router: AppRouterInstance = useRouter();

    // State relatif à la gestion de la taille des hexagones et du zoom par extension
    const [rayon, setRayon] = useState<number>(45);

    // States relatifs à la gestion des onglets de l'éditeur
    const [estTerrainOuvert, setEstTerrainOuvert] = useState<boolean>(false);
    const [terrainSelectionne, setTerrainSelectionne] = useState<string | null>(null);
    const [estResidenceOuverte, setEstResidenceOuverte] = useState<boolean>(false);
    const [residenceSelectionnee, setResidenceSelectionnee] = useState<string | null>(null);
    const [estConnexionsOuverte, setEstConnexionsOuverte] = useState<boolean>(false);
    const [connexionsSelectionnee, setConnexionsSelectionnee] = useState<string | null>(null);

    // States relatif à la gestion des clics lors de la création d'une tyrolienne
    const [tyrolienneStart, setTyrolienneStart] = useState<[number, number] | null>(null);

    // States relatif à la gestion des clics lors de la création d'une rivière
    const [riviereStart, setRiviereStart] = useState<[number, number] | null>(null);

    // States relatif au stockage lors de la création d'une rivière
    const [casesRiviere, setCasesRiviere] = useState<[number, number][]>([]);

    // States pour gérer le mode ajout et suppression : true pour ajout, et false pour suppression
    const [modeTyrolienne, setModeTyrolienne] = useState(true);
    const [modeRiviere, setModeRiviere] = useState(true);

    // Hook pour gérer l'historique (undo/redo)
    const {sauvegarderState, undo, redo, peutUndo, peutRedo, indexCourant} = useHistorique(20);

    // Import de toutes les fonctions du hook useEditeurCarte
    const {
        isLoaded,
        hexagones,
        tyroliennes,
        rivieres,
        posInfo,
        posBio,
        jsonData,
        messages,
        pushMsg,
        appliquerCarte
    } = useEditeurCarte(carteId, rayon);

    // --- CORRECTION MAJEURE ICI ---
    // On sauvegarde l'état initial UNE SEULE FOIS quand la carte est chargée
    // On utilise un useRef ou une vérification sur l'index pour ne pas le faire en boucle
    useEffect(() => {
        // Si c'est chargé, qu'on a des données, et que l'historique est vide (état initial)
        if (isLoaded && jsonData && indexCourant === -1) {
            sauvegarderState(jsonData);
        }
    }, [isLoaded, jsonData, indexCourant, sauvegarderState]);
    // -----------------------------

    // Fonction qui permet d'ouvrir / fermer les onglets de la sidebar
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

    // Fonction pour gérer le undo
    const handleUndo = async () => {
        const statePrecedent = undo();
        if (statePrecedent) {
            const reponse = await fetch("/api/cartes/remplacer", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: carteId,
                    data: statePrecedent
                })
            });

            const resultat = await reponse.json();

            if (resultat.status === "success") {
                appliquerCarte(statePrecedent, rayon);
                const date = new Date().toLocaleString().toString();
                pushMsg("[" + date + "] - Annulation de la dernière action", "ok");
            } else {
                pushMsg("Erreur lors de l'annulation", "erreur");
            }
        }
    };

    // Fonction pour gérer le redo
    const handleRedo = async () => {
        const stateSuivant = redo();
        if (stateSuivant) {
            const reponse = await fetch("/api/cartes/remplacer", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: carteId,
                    data: stateSuivant
                })
            });

            const resultat = await reponse.json();

            if (resultat.status === "success") {
                appliquerCarte(stateSuivant, rayon);
                const date = new Date().toLocaleString().toString();
                pushMsg("[" + date + "] - Rétablissement de la dernière action", "ok");
            } else {
                pushMsg("Erreur lors du rétablissement", "erreur");
            }
        }
    };

    // Raccourcis clavier pour undo/redo
    useEffect(() => {
        const handleBoutonPressee = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (peutUndo) handleUndo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (peutRedo) handleRedo();
            }
        };

        window.addEventListener('keydown', handleBoutonPressee);
        return () => window.removeEventListener('keydown', handleBoutonPressee);
    }, [peutUndo, peutRedo]);

    // Import de toutes les fonctions du hook useClickHandler
    const {handleTerrainClic, handleResidenceClic, handleTyrolienneClic, handleRiviereClic} = useClicHandler({
        carteId,
        rayon,
        hexagones,
        posInfo,
        posBio,
        terrainSelectionne,
        residenceSelectionnee,
        connexionsSelectionnee,
        tyrolienneStart,
        riviereStart,
        casesRiviere,
        setTyrolienneStart,
        setRiviereStart,
        setCasesRiviere,
        pushMsg,
        appliquerCarte,
        sauvegardeHistorique: sauvegarderState,
        jsonData
    });

    if (!isLoaded) {
        return <div>Chargement de la carte...</div>;
    } else {
        const graphe = new Graphe(jsonData);
        graphe.actualiserGraphe();
        return (
            <div className={"container-fluid editeur"}>
                {/* Partie de gauche : Sidebar */}
                <Sidebar carteId={carteId} rayon={rayon} setRayon={setRayon} terrainSelectionne={terrainSelectionne}
                         residenceSelectionnee={residenceSelectionnee}
                         connexionsSelectionnee={connexionsSelectionnee} selectionner={selectionner}
                         estTerrainOuvert={estTerrainOuvert} setEstTerrainOuvert={setEstTerrainOuvert}
                         estResidenceOuverte={estResidenceOuverte} setEstResidenceOuverte={setEstResidenceOuverte}
                         estConnexionsOuverte={estConnexionsOuverte}
                         setEstConnexionsOuverte={setEstConnexionsOuverte}
                         modeTyrolienne={modeTyrolienne} setModeTyrolienne={setModeTyrolienne}
                         modeRiviere={modeRiviere} setModeRiviere={setModeRiviere}
                         onChangerCarte={() => router.push(`/editeur/modifier?id=${carteId}&show=true`)}
                         onUndo={handleUndo} onRedo={handleRedo} peutUndo={peutUndo} peutRedo={peutRedo}/>

                {/* Modal qui s'ouvre quand on clique sur l'onglet pour changer de carte */}
                {show && <GestionnaireModal prefixe={`/editeur/modifier`}
                                            onCloseHref={`/editeur/modifier?id=${carteId}`}/>}

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
                            graphe={graphe}
                            onClick={(hex) => {
                                const coordonnees_hex: string[] = hex.id.split("-");
                                const x: number = Number(coordonnees_hex[0]);
                                const y: number = Number(coordonnees_hex[1]);
                                console.log("x = " + x);
                                console.log("y = " + y);
                                const date: string = new Date().toLocaleString().toString();

                                // On gère chacun des cas possibles d'onglets
                                if (terrainSelectionne) {
                                    handleTerrainClic(terrainSelectionne, x, y, date);
                                } else if (residenceSelectionnee) {
                                    handleResidenceClic(residenceSelectionnee, hex, x, y, date);
                                } else if (connexionsSelectionnee === "tyrolienne") {
                                    handleTyrolienneClic(hex, x, y, date, modeTyrolienne);
                                } else if (connexionsSelectionnee === "riviere") {
                                    handleRiviereClic(hex, x, y, date, modeRiviere);
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