// Dépendances
"use client";
import {Affichage} from "./Affichage";
import {CarteJSON, Contexte, Joueur, Position} from "./Interfaces";
import {useEffect, useState} from "react";
import {TraitementCarte, TraitementGraphe, TraitementTotal, TraitementJoueurInitial} from "./Traitement";
import carteBrute from "./carte.json" assert {type: "json"};
const carteJSON: CarteJSON = carteBrute as CarteJSON;

/*
=== Home ===
Page principale du répertoire.
*/
export default function Home() {
    // États pour stocker les différentes informations nécessaires au fonctionnement du jeu
    const [rayon, definirRayon] = useState(60);
    const [tour, changerTour] = useState(0);
    const [joueurInfo, setJoueurInfo] = useState<Joueur>(TraitementJoueurInitial(carteJSON, "info"));
    const [joueurBio, setJoueurBio] = useState<Joueur>(TraitementJoueurInitial(carteJSON, "bio"));
    const [contexte, setContexte] = useState<Contexte>(TraitementTotal(carteJSON, rayon, [joueurInfo, joueurBio]));
    

    // Mise à jour de la carte
    // Appelé quand le rayon change
    useEffect(() => {
        setContexte({
            carte: TraitementCarte(carteJSON, rayon),
            graphe: contexte.graphe
        });
    }, [rayon]);

    // Mise à jour du Graphe
    // Appelé quand les positions des joueurs changent
    useEffect(() => {
        setContexte({
            carte: contexte.carte,
            graphe: TraitementGraphe(contexte.carte, [joueurInfo, joueurBio])
        });
    }, [joueurInfo, joueurBio]);

    /*
    === deplacerJoueur ===
    Fonction pour déplacer le joueur, qui est déterminé par la valeur de "tour".
    La fonction est appelée à chaque fois qu'une case a détecté un clic, et se charge de vérifier si le déplacement est permis.
    Elle change également la variable "tour" si le mouvement est réussi, pour passer à l'autre joueur.

    Todo : Optimiser le code qui est beaucoup trop long et répétitif.
    */
    function deplacerJoueur(position: Position): void {
        if (tour === 0) {
            const arc = contexte.graphe.find(g => 
                g.noeud.x === joueurInfo.position.x &&
                g.noeud.y === joueurInfo.position.y
            );
            if (arc && arc.voisins.some(v => v.x === position.x && v.y === position.y)) {
                setJoueurInfo({
                    position: position,
                    mascotte: ((position.x === contexte.carte.residenceBio.x) && (position.y === contexte.carte.residenceBio.y)) ? true : joueurInfo.mascotte
                });
                changerTour(1);
            }
        } else {
            const arc = contexte.graphe.find(g => 
                g.noeud.x === joueurBio.position.x &&
                g.noeud.y === joueurBio.position.y
            );
            if (arc && arc.voisins.some(v => v.x === position.x && v.y === position.y)) {
                setJoueurBio({
                    position: position,
                    mascotte: ((position.x === contexte.carte.residenceInfo.x) && (position.y === contexte.carte.residenceInfo.y)) ? true : joueurBio.mascotte
                });
                changerTour(0);
            }
        }
    }

    /* === Types === */
    type ModeJeu = "" | "pvp" | "bot";
    type PremierTour = "info" | "bio" | "random";
    type DifficulteIA = "stupide" | "facile" | "moyen" | "difficile" | "extreme";

    /* === États === */
    const [mode, setMode] = useState<ModeJeu>("");
    const [premierTour, setPremierTour] = useState<PremierTour>("random");
    const [difficulte, setDifficulte] = useState<DifficulteIA>("facile");

    if( false ) {
    return (
        <>
            <div className="container-fluid">
                {/* === Curseur, contrôle le rayon === */}
                <input 
                    type="range"
                    min={5}
                    max={200}
                    value={rayon}
                    onChange={(event) => {
                        definirRayon(Number(event.target.value));
                    }}
                />

                {/* === Affichage de la carte === */}
                <Affichage
                    contexte = {contexte}
                    rayon = {rayon}
                    tour = {tour}
                    joueurInfo = {joueurInfo}
                    joueurBio = {joueurBio}
                    deplacement = {deplacerJoueur}
                />
            </div>
        </>
    );
    } else {
return (
    <>
        <header className="container-fluid">
            <h1 className="text-center">🐧/🥦 MASCOTTE HEX</h1>
        </header>

        <main className="container-fluid" style={{ height: "calc(100vh - 4rem)" }}>
            <div className="grid" style={{ height: "100%" }}>
                {/* === EDITEUR === */}
                <div className="container">
                    <article>
                        <h3 className="text-center">🔧🗺️ EDITEUR DE CARTE</h3>
                    </article>
                </div>

                {/* === ENTRAINEMENT === */}
                <div className="container" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <article style={{ flex: "0 0 auto" }}>
                        <h3 className="text-center">🎯⚔️ ENTRAINEMENT</h3>

                        {/* === Sélection du mode === */}
                        <div className="container" style={{ maxWidth: "420px", margin: "0 auto" }}>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value as ModeJeu)}
                            >
                                <option value="" disabled>
                                    👉 CHOISIR MODE DE JEU
                                </option>
                                <option value="pvp">🆚 1 CONTRE 1</option>
                                <option value="bot">🤖 CONTRE L'IA</option>
                            </select>
                        </div>

                        <hr />

                        {/* === Qui commence (1v1) === */}
                        {mode === "pvp" && (
                            <>
                                <h4>Qui commence ?</h4>
                                <div role="group">
                                    {[
                                        { key: "info", label: "🐧 Informaticiens", color: "#9486E1" },
                                        { key: "bio", label: "🥦 Biologistes", color: "#F17961" },
                                        { key: "random", label: "🎲 Aléatoire", color: "#6FC1F7" }
                                    ].map((v) => {
                                        const selected = premierTour === v.key;
                                        return (
                                            <button
                                                key={v.key}
                                                aria-pressed={selected}
                                                onClick={() => setPremierTour(v.key as PremierTour)}
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
                                <hr />
                            </>
                        )}

                        {/* === Choix de l'équipe (contre l'IA) === */}
                        {mode === "bot" && (
                            <>
                                <h4>Choisir votre équipe</h4>
                                <div role="group">
                                    {[
                                        { key: "info", label: "🐧 Informaticiens", color: "#9486E1" },
                                        { key: "bio", label: "🥦 Biologistes", color: "#F17961" }
                                    ].map((v) => {
                                        const selected = premierTour === v.key; // stocke l'équipe choisie
                                        return (
                                            <button
                                                key={v.key}
                                                aria-pressed={selected}
                                                onClick={() => setPremierTour(v.key as PremierTour)}
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
                                <hr />

                                {/* === Difficulté IA === */}
                                <h4>Difficulté de l’IA</h4>
                                <div role="group">
                                    {[
                                        { key: "stupide", emoji: "🤪", bgColor: "#4ade80" },
                                        { key: "facile", emoji: "🙂", bgColor: "#a3e635" },
                                        { key: "moyen", emoji: "😐", bgColor: "#facc15" },
                                        { key: "difficile", emoji: "😈", bgColor: "#f97316" },
                                        { key: "extreme", emoji: "🔥", bgColor: "#ef4444" }
                                    ].map((v) => {
                                        const selected = difficulte === v.key;
                                        return (
                                            <button
                                                key={v.key}
                                                onClick={() => setDifficulte(v.key as DifficulteIA)}
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
                                <hr />
                            </>
                        )}
                    </article>

                    {/* === Carte + bouton Démarrer === */}
                    <article style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div style={{ flex: 1, backgroundColor: "#e5e7eb", border: "1px solid #ccc", margin: "1rem 0" }}>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                            <button disabled>Choisir une carte</button>
                            <button disabled>▶️ Démarrer</button>
                        </div>
                    </article>
                </div>
            </div>
        </main>
    </>
);



    }
}