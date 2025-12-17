// Dépendances
"use client";
import {Affichage} from "./modules/Affichage";
import {plusCourtChemin} from "./modules/Bot";
import {
    Arc,
    CarteJSON,
    Contexte,
    DifficulteIA,
    Joueur,
    ModeJeu,
    Noeud,
    Position,
    PremierTour
} from "./modules/Interfaces";
import {useEffect, useState} from "react";
import {TraitementCarte, TraitementGraphe, TraitementTotal} from "./modules/Traitement";
import {useSearchParams} from "next/navigation";
import GestionnaireModal from "@/app/components/editeur/modals/GestionnaireModal";
import Link from "next/link";
import {getCarte} from "@/app/actions/getCarte";
import NouveauPopUpModal from "@/app/components/editeur/modals/NouveauPopUpModal";
import GrilleEditeur from "@/app/components/editeur/GrilleEditeur";
import {Case, Connexion} from "@/app/components/Structure";
import {Terrain} from "@/app/components/Terrain";

// Je commenterais le code demain si j'ai pas trop de bugs ou de problèmes à corriger
// J'ai mis l'ancienne page dans page.old.tsx
// Une fois la version finale réalisée faudra penser à nettoyer un peu les fichiers inutiles, pour l'instant dans le doutes on garde
export default function Home() {
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");
    const showSelection = searchParams.get("showSelec");
    const showVictoire = searchParams.get("showVict");
    const show = searchParams.get("show");
    const showModification = searchParams.get("showModif");

    const [contexte, definirContexte] = useState<Contexte | undefined>(undefined);
    const [tour, changerTour] = useState<number>(0);
    const [rayon, definirRayon] = useState<number>(60);
    const [carteJSONvisu, definirCarteJSONvisu] = useState<CarteJSON | null>(null);
    const [carteJSON, definirCarteJSON] = useState<CarteJSON | null>(null);

    const [modeJeu, definirModeJeu] = useState<ModeJeu | undefined>("");
    const [premierTour, definirPremierTour] = useState<PremierTour | undefined>(undefined);
    const [difficulteIA, definirDifficulteIA] = useState<DifficulteIA>("facile");

    const [jeuDemarre, definirJeuDemarre] = useState<boolean>(false);
    const [victoire, definirVictoire] = useState<"info" | "bio" | null>(null);

    // Nécessaire pour la visualisation de la carte
    const [hexagones, definirHexagones] = useState<Case[]>([]);
    const [tyroliennes, definirTyroliennes] = useState<Connexion[]>([]);
    const [rivieres, definirRivieres] = useState<Connexion[]>([]);

    useEffect(() => {
        if (contexte) {
            contexte.carte = TraitementCarte(carteJSON, rayon);
        }
    }, [rayon]);

    useEffect(() => {
        if (!contexte || modeJeu !== "bot") return;

        const tourIA = premierTour === "info" ? 1 : 0;

        if (tour === tourIA) {
            deplacerIA();
        }
    }, [tour]);

    // Charger la carte quand carteId change
    useEffect(() => {
        if (carteId) {
            showCarteVisu();
        }
    }, [carteId, rayon]);

    // Affreux
    function deplacerIA() {
        if (!contexte) return;

        const iaInfo = modeJeu === "bot" && premierTour === "bio";
        const joueurIA = iaInfo ? contexte.joueurInfo : contexte.joueurBio;
        const joueurHumain = iaInfo ? contexte.joueurBio : contexte.joueurInfo;

        // Noeud d'arrivée
        let arrivee: Arc | undefined;
        if (joueurIA.mascotte) {
            const res = iaInfo ? contexte.carte.residenceInfo : contexte.carte.residenceBio;
            arrivee = contexte.graphe.find(g => g.noeud.x === res.x && g.noeud.y === res.y);
        } else {
            const res = iaInfo ? contexte.carte.residenceBio : contexte.carte.residenceInfo;
            arrivee = contexte.graphe.find(g => g.noeud.x === res.x && g.noeud.y === res.y);
        }

        if (!arrivee) return;

        let chemin: Noeud[] | null = null;

        const arriveeBloquee =
            joueurHumain.position.x === arrivee.noeud.x &&
            joueurHumain.position.y === arrivee.noeud.y;

        if (arriveeBloquee) {
            const chemins: Noeud[][] = [];
            arrivee.voisins.forEach(voisin => { // Si l'arrivée est bloquée, trouver le plus court chemin parmis ses voisins
                const c = plusCourtChemin(contexte.graphe, joueurIA.position, voisin, difficulteIA);
                if (c) chemins.push(c);
            });
            if (chemins.length === 0) return;
            chemin = chemins.reduce((a, b) => (a.length < b.length ? a : b));
        } else {
            chemin = plusCourtChemin(contexte.graphe, joueurIA.position, arrivee.noeud, difficulteIA);
        }

        if (!chemin || chemin.length < 2) return;

        const prochainePosition = chemin[1];

        const joueurIAUpdate: Joueur = {
            ...joueurIA,
            position: prochainePosition,
            mascotte: joueurIA.mascotte ||
                (prochainePosition.x === (iaInfo ? contexte.carte.residenceBio.x : contexte.carte.residenceInfo.x) &&
                    prochainePosition.y === (iaInfo ? contexte.carte.residenceBio.y : contexte.carte.residenceInfo.y))
        };

        const nouveauContexte: Contexte = {
            ...contexte,
            joueurInfo: iaInfo ? joueurIAUpdate : contexte.joueurInfo,
            joueurBio: !iaInfo ? joueurIAUpdate : contexte.joueurBio
        };

        const resAdverse = iaInfo ? nouveauContexte.carte.residenceInfo : nouveauContexte.carte.residenceBio;
        if (joueurIAUpdate.mascotte &&
            joueurIAUpdate.position.x === resAdverse.x &&
            joueurIAUpdate.position.y === resAdverse.y) { // Vérifier si l'IA à gagnée
            definirContexte(nouveauContexte);
            changerTour(iaInfo ? 2 : 3);
            definirVictoire(iaInfo ? "info" : "bio");
            return;
        }

        definirContexte(nouveauContexte);
        changerTour(t => (t === 0 ? 1 : 0));
    }


    function deplacerJoueur(position: Position) {
        if (modeJeu == "bot" && ((premierTour === "info" && tour === 1) || (premierTour === "bio" && tour === 0))) return; // C'est au tour du bot de jouer
        if (tour > 1) return; // La partie est terminée, quelqu'un à gagné

        if (contexte) {
            const joueurActuel: Joueur = tour === 0 ? contexte.joueurInfo : contexte.joueurBio;
            const arc: Arc | undefined = contexte.graphe.find(g =>
                g.noeud.x === joueurActuel.position.x &&
                g.noeud.y === joueurActuel.position.y
            );
            if (arc && arc.voisins.some(v => v.x === position.x && v.y === position.y)) { // Si la position est bien dans les voisins du joueur
                if (tour === 0) {
                    contexte.joueurInfo.position = position;
                    contexte.joueurInfo.mascotte = ((position.x === contexte.carte.residenceBio.x) && (position.y === contexte.carte.residenceBio.y)) ? true : contexte.joueurInfo.mascotte;
                } else {
                    contexte.joueurBio.position = position;
                    contexte.joueurBio.mascotte = ((position.x === contexte.carte.residenceInfo.x) && (position.y === contexte.carte.residenceInfo.y)) ? true : contexte.joueurBio.mascotte;
                }
                tourSuivant();
            }
        }
    }

    function tourSuivant() {
        if (contexte) {
            // On vérifie si la partie se termine (victoire d'un des joueurs)
            if (tour === 0) {
                if (contexte.joueurInfo.position.x === contexte.carte.residenceInfo.x &&
                    contexte.joueurInfo.position.y === contexte.carte.residenceInfo.y &&
                    contexte.joueurInfo.mascotte) {
                    changerTour(2);
                    definirVictoire("info");
                    return;
                }
            } else if (tour === 1) {
                if (contexte.joueurBio.position.x === contexte.carte.residenceBio.x &&
                    contexte.joueurBio.position.y === contexte.carte.residenceBio.y &&
                    contexte.joueurBio.mascotte) {
                    changerTour(3);
                    definirVictoire("bio");
                    return;
                }
            }

            // On change de tour
            const prochainTour = tour === 0 ? 1 : 0;
            changerTour(prochainTour);

            // On met à jour le graphe (avec les nouvelles positions des joueurs)
            contexte.graphe = TraitementGraphe(contexte.carte, contexte.joueurInfo, contexte.joueurBio);
        }
    }

    // Fonction qui se charge de charger la carte et de la visualiser
    async function showCarteVisu() {
        if (carteId) {
            const carte = await getCarte(carteId);
            definirCarteJSONvisu(carte);

            const hex = Terrain(carte, rayon);
            const tyrol = carte.connexions.filter(c => c.type === "tyrolienne");
            const riv = carte.connexions.filter(c => c.type === "riviere");

            definirHexagones(hex);
            definirTyroliennes(tyrol);
            definirRivieres(riv);
        }
    }

    async function demarrerJeu() {
        if (modeJeu && premierTour && carteId) {
            const carte = await getCarte(carteId);
            definirCarteJSON(carte);

            definirContexte(TraitementTotal(carte, rayon));
            changerTour((premierTour === "random") ? (Math.floor(Math.random() * 2)) : (premierTour === "info" ? 0 : 1));
            definirJeuDemarre(true);
        }
    }

    // J'ai pas compris comment avait été implémenté le modal et pourquoi il avait besoin d'autant de composants externes
    // De plus, il ne marchait pas à la victoire, il fallait réactualiser la carte pour le voir
    // Voici donc une version "simple" avec peu de variables pour stocker l'état du modal
    function afficherVictoire() {
        if (!victoire) return null; // Pour l'afficher que quand c'est nécessaire

        return (
            <dialog open>
                <article>
                    <header style={{position: "relative"}}>
                        <p><strong>
                            {victoire === "info" ? "🥇🐧 Les informaticiens ont gagnés" : "🥇🥦 Les biologistes ont gagnés"}
                        </strong></p>
                        <button
                            aria-label="Close"
                            rel="prev"
                            onClick={() => definirVictoire(null)}
                            style={{
                                position: "absolute",
                                top: "1rem",
                                right: "0.5rem"
                            }} // Pour mettre la croix à droite et au milieu (plus joli)
                        />
                    </header>

                    <p>Bravo franchement j'applaudit 👏👏</p>

                    {boutonRedemarrer()}
                </article>
            </dialog>
        );
    }

    function boutonRedemarrer() {
        if (tour < 2) return;

        return (
            <button
                onClick={() => {
                    definirDifficulteIA("facile"); // On remet la difficulté par défaut
                    definirModeJeu("");
                    definirPremierTour(undefined);
                    definirVictoire(null); // En bref toutes les variables on les réinitialise
                    definirJeuDemarre(false); // Pour retourner sur l'écran de sélection comme neuf
                }}
            >🔁 Rejouer</button>
        );
    }

    if (jeuDemarre && contexte) {
        return (
            <>
                {afficherVictoire()}

                <div className="container-fluid">
                    <input
                        type="range"
                        min={5}
                        max={200}
                        value={rayon}
                        onChange={(event) => {
                            definirRayon(Number(event.target.value));
                        }}
                    />
                    <Affichage
                        contexte={contexte}
                        rayon={rayon}
                        tour={tour}
                        deplacement={deplacerJoueur}
                    />
                </div>

                {boutonRedemarrer()}
            </>
        );
    } else {
        return (
            <>
                <header className="container-fluid">
                    <h1 className="text-center">🐧/🥦 MASCOTTE HEX</h1>
                </header>

                <main className="container-fluid" style={{height: "calc(100vh - 4rem)"}}>
                    <div className="grid" style={{height: "100%"}}>
                        <div className="container">
                            <article>
                                <h3 className="text-center">🔧🗺️ EDITEUR DE CARTE</h3>
                                <br/>
                                <div className={"grid"}>
                                    <Link id="btnNouveau" href="/?show=true" role="button">Nouveau</Link>
                                    <Link id="btnModifier" href="/?showModif=true" role="button">Modifier</Link>
                                </div>

                                {show && <NouveauPopUpModal/>}
                                {showModification &&
                                    <GestionnaireModal prefixe="./editeur/modifier" onCloseHref={"/"}/>}
                            </article>

                            <article style={{
                                flex: "1 1 auto",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}>
                                <div style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    overflow: "auto"
                                }}>
                                    {hexagones.length > 0 && <GrilleEditeur
                                        rayon={rayon}
                                        hexagones={hexagones}
                                        mascotteInfo={null}
                                        mascotteBio={null}
                                        rivieres={rivieres}
                                        tyroliennes={tyroliennes}
                                        onClick={(hex) => {
                                        }}
                                    />}
                                    <br/>
                                </div>

                                <div style={{display: "flex", justifyContent: "center", gap: "1rem"}}>
                                    <Link id={"btnSelec"} href={"?showSelec=true"} role={"button"}>
                                        Choisir une carte
                                    </Link>
                                    {modeJeu && premierTour && carteId &&
                                        <button onClick={demarrerJeu}>▶️ Démarrer</button>}
                                </div>
                            </article>

                        </div>
                        <div className="container" style={{display: "flex", flexDirection: "column", height: "100%"}}>
                            <article style={{flex: "0 0 auto"}}>
                                <h3 className="text-center">🎯⚔️ ENTRAINEMENT</h3>
                                <div className="container" style={{maxWidth: "420px", margin: "0 auto"}}>
                                    <select value={modeJeu}
                                            onChange={(mode) => definirModeJeu(mode.target.value as ModeJeu)}>
                                        <option value="" disabled>👉 CHOISIR MODE DE JEU</option>
                                        <option value="pvp">🆚 1 CONTRE 1</option>
                                        <option value="bot">🤖 CONTRE L'IA</option>
                                    </select>
                                </div>

                                {modeJeu === "pvp" && (
                                    <>
                                        <hr/>
                                        <h4>Qui commence ?</h4>
                                        <div role="group">
                                            {[
                                                {key: "info", label: "🐧 Informaticiens", color: "#9486E1"},
                                                {key: "bio", label: "🥦 Biologistes", color: "#F17961"},
                                                {key: "random", label: "🎲 Aléatoire", color: "#6FC1F7"}
                                            ].map((v) => {
                                                const selected = premierTour === v.key;
                                                return (
                                                    <button
                                                        key={v.key}
                                                        aria-pressed={selected}
                                                        onClick={() => definirPremierTour(v.key as PremierTour)}
                                                        style={{
                                                            fontWeight: selected ? "bold" : undefined,
                                                            textDecoration: selected ? "underline" : undefined,
                                                            backgroundColor: v.color,
                                                            color: "#000"
                                                        }}
                                                    >
                                                        {v.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                                {modeJeu === "bot" && (
                                    <>
                                        <hr/>
                                        <h4>Choisir votre équipe</h4>
                                        <div role="group" style={{flexWrap: "wrap"}}>
                                            {[
                                                {key: "info", label: "🐧 Informaticiens", color: "#9486E1"},
                                                {key: "bio", label: "🥦 Biologistes", color: "#F17961"}
                                            ].map((v) => {
                                                const selected = premierTour === v.key;
                                                return (
                                                    <button
                                                        key={v.key}
                                                        aria-pressed={selected}
                                                        onClick={() => definirPremierTour(v.key as "info" | "bio")}
                                                        style={{
                                                            fontWeight: selected ? "bold" : undefined,
                                                            textDecoration: selected ? "underline" : undefined,
                                                            backgroundColor: v.color,
                                                            color: "#000"
                                                        }}
                                                    >
                                                        {v.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <hr/>

                                        <h4>Difficulté de l’IA</h4>
                                        <div role="group">
                                            {[
                                                {key: "stupide", emoji: "🤪", bgColor: "#4ade80"},
                                                {key: "facile", emoji: "🙂", bgColor: "#a3e635"},
                                                {key: "moyen", emoji: "😐", bgColor: "#facc15"},
                                                {key: "difficile", emoji: "😈", bgColor: "#f97316"},
                                                {key: "extreme", emoji: "🔥", bgColor: "#ef4444"}
                                            ].map((v) => {
                                                const selected = difficulteIA === v.key;
                                                return (
                                                    <button
                                                        key={v.key}
                                                        onClick={() => definirDifficulteIA(v.key as DifficulteIA)}
                                                        style={{
                                                            fontWeight: selected ? "bold" : undefined,
                                                            textDecoration: selected ? "underline" : undefined,
                                                            backgroundColor: v.bgColor,
                                                            color: "#000"
                                                        }}
                                                    >
                                                        {v.emoji} {v.key.toUpperCase()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </article>

                        </div>
                    </div>

                    {showSelection &&
                        <GestionnaireModal prefixe={"/"} onCloseHref={"/"} restriction/>}
                </main>
            </>
        );
    }
}