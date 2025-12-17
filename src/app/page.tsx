// Dépendances
"use client";
import {Affichage} from "@/app/modules/Affichage";
import {plusCourtChemin} from "@/app/modules/Bot";
import GestionnaireModal from "@/app/components/editeur/modals/GestionnaireModal";
import {getCarte} from "@/app/actions/getCarte";
import GrilleEditeur from "@/app/components/editeur/GrilleEditeur";
import {Arc, CarteJSON, Contexte, DifficulteIA, Joueur, ModeJeu, Noeud, Position, PremierTour} from "@/app/modules/Interfaces";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import NouveauPopUpModal from "@/app/components/editeur/modals/NouveauPopUpModal";
import {useEffect, useState} from "react";
import {Case, Connexion} from "@/app/components/Structure";
import {Terrain} from "@/app/components/Terrain";
import {TraitementCarte, TraitementGraphe, TraitementTotal} from "@/app/modules/Traitement";
import VictoirePopUpModal from "@/app/components/VictoirePopUpModal";
import {TbZoom} from "react-icons/tb";

/* === Home ===
Page principale du projet, c'est elle qui gère le fonctionnement du jeu, et la selection des différents modes
Elle relie tout
*/
export default function Home() {
    // Permet de récupérer les différents paramètres qui sont dans l'URL à différents moments
    const router = useRouter();
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");
    const showSelection = searchParams.get("showSelec");
    const showVictoire = searchParams.get("showVict");
    const show = searchParams.get("show");
    const showModification = searchParams.get("showModif");

    // États pour stocker les différents objets à la visualisation de la carte
    const [carteJSONvisu, definirCarteJSONvisu] = useState<CarteJSON | null>(null);
    const [hexagones, definirHexagones] = useState<Case[]>([]);
    const [residenceInfo, definirResidenceInfo] = useState(null);
    const [residenceBio, definirResidenceBio] = useState(null);
    const [tyroliennes, definirTyroliennes] = useState<Connexion[]>([]);
    const [rivieres, definirRivieres] = useState<Connexion[]>([]);

    // Etats pour stocker les différents objets nécessaires pour stocker les informations du jeu
    const [contexte, definirContexte] = useState<Contexte | undefined>(undefined);
    const [rayon, definirRayon] = useState<number>(60);
    const [carteJSON, definirCarteJSON] = useState<CarteJSON | null>(null);

    // Etats pour stocker les paramètres selectionnés sur la page (mode de jeu, difficulté, etc)
    const [modeJeu, definirModeJeu] = useState<ModeJeu | undefined>("");
    const [premierTour, definirPremierTour] = useState<PremierTour | undefined>(undefined);
    const [difficulteIA, definirDifficulteIA] = useState<DifficulteIA>("facile");

    // Etats de l'avancement du jeu, on sait ici si le jeu a démarré, finit, et quel est le joueur (ou bot) qui doit jouer
    const [jeuDemarre, definirJeuDemarre] = useState<boolean>(false);
    const [tour, changerTour] = useState<number>(0);
    const [victoire, definirVictoire] = useState<"Info" | "Bio" | null>(null);

    // Recalcule les positions des hexagones, leurs tailles, si la taille de la carte est ajustée
    // Et affiche donc la nouvelle carte en résultant
    useEffect(() => {
        if (!carteJSON) return;
        if (contexte) {
            contexte.carte = TraitementCarte(carteJSON, rayon);
        }
    }, [rayon]);

    // Si le joueur joue contre l'IA (bon mode de jeu) et que c'est au tour du not, le bot se déplace
    useEffect(() => {
        if (!contexte || modeJeu !== "bot") return;

        const tourIA = premierTour === "info" ? 1 : 0;

        if (tour === tourIA) {
            deplacerIA();
        }
    }, [tour]);

    // Permet de changer la partie de visualisation de carte
    useEffect(() => {
        if (carteId) {
            showCarteVisu();
        }
    }, [carteId, rayon]);

    // Fonction qui permet de charger la carte sélectionnée afin de la visualiser
    async function showCarteVisu() {
        if (carteId) {
            const carte: CarteJSON = await getCarte(carteId);

            console.log(carte);

            if (!carte || !carte.résidences) return;

            definirCarteJSONvisu(carte);

            const coordResidenceInfo = carte.résidences.info;
            const coordResidenceBio = carte.résidences.bio;

            const idResidenceInfo = `${coordResidenceInfo[0]}-${coordResidenceInfo[1]}`;
            const idResidenceBio = `${coordResidenceBio[0]}-${coordResidenceBio[1]}`;

            const hex = Terrain(carte, rayon);
            const residenceInfo = hex.find(h => h.id === idResidenceInfo);
            const residenceBio = hex.find(h => h.id === idResidenceBio);
            const tyrol = carte.connexions.filter(c => c.type === "tyrolienne");
            const riv = carte.connexions.filter(c => c.type === "riviere");

            definirHexagones(hex);
            definirResidenceBio(residenceBio);
            definirResidenceInfo(residenceInfo);
            definirTyroliennes(tyrol);
            definirRivieres(riv);
        }
    }

    /* === deplacerIA === 
    Deplace l'IA vers la meilleurs case (en fonction de sa difficulté)
    D'abord on détermine si l'IA veut capturer la mascotte ennemi ou la ramener dans sa résidence
    Ensuite on définit le noeud de départ (l'ia) et celui d'arrivée, en fonction de ce que j'ai dis une ligne plus haut
    Si l'arrivée est bloquée alias le joueur ennemi est sur la case d'arrivée, il trouve le plus court chemin parmis ses voisins
    Enfin il apelle la fonction pour trouver le meilleur chemin en fonction de la difficulté (BFS) et il se déplace à la prochaine case dans ce chemin
    Puis il vérifie si elle (l'IA) à gagné, si non, elle laisse le joueur jouer (passe le tour)
    (abus de langage pour IA c'est plus un algo)
    */
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
            definirVictoire(iaInfo ? "Info" : "Bio");
            router.push(`/?id=${carteId}&showVict=true`);
            return;
        }

        definirContexte(nouveauContexte);
        changerTour(t => (t === 0 ? 1 : 0));
    }


    /*=== deplacerJoueur ===
    Fonction enclenchée dès qu'un clic à été effectué sur une des cases
    Si la case est accessible depuis le joueur dont s'est le tour, il s'y déplace, puis passe le tour
    Sinon il ne se passe rien
    */
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

    /* === tourSuivant=== 
    Vérifie si l'un des joueurs (humain) à gagné
    Sinon passe au tour suivant, et actualise le graphe, pour mettre à jour les positions des joueurs sur celui ci
    */
    function tourSuivant() {
        if (contexte) {
            // On vérifie si la partie se termine (victoire d'un des joueurs)
            if (tour === 0) {
                if (contexte.joueurInfo.position.x === contexte.carte.residenceInfo.x &&
                    contexte.joueurInfo.position.y === contexte.carte.residenceInfo.y &&
                    contexte.joueurInfo.mascotte) {
                    changerTour(2);
                    definirVictoire("Info");
                    router.push(`/?id=${carteId}&showVict=true`);
                    return;
                }
            } else if (tour === 1) {
                if (contexte.joueurBio.position.x === contexte.carte.residenceBio.x &&
                    contexte.joueurBio.position.y === contexte.carte.residenceBio.y &&
                    contexte.joueurBio.mascotte) {
                    changerTour(3);
                    definirVictoire("Bio");
                    router.push(`/?id=${carteId}&showVict=true`);
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

    /* === demarrerJeu === 
    Fonction appelée dès que le bouton pour démarrer la partie est appuyé
    La carte, le mode de jeu, le premier joueur et la difficulté de l'IA ont été sélectionnés en fonction de ce que le joueur à choisi
    La fonction se charge donc d'initialiser chaque etat important pour la partie, charger la carte, définir qui joue en premier, etc
    */
    async function demarrerJeu() {
        if (modeJeu && premierTour && carteId) {
            const carte = await getCarte(carteId);
            definirCarteJSON(carte);
            definirContexte(TraitementTotal(carte, rayon));
            changerTour((premierTour === "random") ? (Math.floor(Math.random() * 2)) : (premierTour === "info" ? 0 : 1));
            definirJeuDemarre(true);
        }
    }

    /* === boutonRedemarrer 
    Quand la partie est terminée, ce bouton est affiché
    Il permet de revenir à l'écran de sélection et de réinitialiser tous les etats, pour ne pas causer de soucis avec la partie suivante
    */
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
            >🔄 Rejouer</button>
        );
    }

    if (jeuDemarre && contexte) {
        return (
            <>
                {/* 
                Affiche le popup de victoire dès qu'un joueur (ou bot) gagne
                showVictoire permet de savoir si le popup est ouvert ou fermé
                quand quelqu'un gagne, showVictoire est mis à true, quand on clique sur le bouton Close, showVictoire est mis à false
                */}
                {showVictoire && <VictoirePopUpModal
                    titre={victoire === "Info" ? "🐧 Victoire de l'équipe Info" : "🥦 Victoire de l'équipe Bio"}
                    texte={"Bravo 👏"}
                    onClickFermeture={() => router.push(`/?id=${carteId}`)}
                    button={true}
                    buttonLabel="🔄 Rejouer"
                    onClickButton={() => {
                        router.push("/");
                        definirDifficulteIA("facile");
                        definirModeJeu("");
                        definirPremierTour(undefined);
                        definirVictoire(null);
                        definirJeuDemarre(false);
                    }}
                />}

                <header className={"head-compact"}>
                    <h1 className={"titre-head"}>{`Jeu en cours sur la carte "${carteId}"`}</h1>
                </header>
                <main>
                    <div className={"container-fluid visualiser"}>
                        <div className={"sidebar-right"}>
                            <div className={"grille2"}>
                                <div className={"contenu-visu"}>
                                    {/* Appel à la fonction affichage pour afficher la carte */}
                                    <Affichage
                                        contexte={contexte}
                                        rayon={rayon}
                                        tour={tour}
                                        deplacement={deplacerJoueur}
                                    />
                                    <br/>
                                    <button
                                        onClick={() => {
                                            router.push("/");
                                            definirDifficulteIA("facile");
                                            definirModeJeu("");
                                            definirPremierTour(undefined);
                                            definirVictoire(null);
                                            definirJeuDemarre(false);
                                        }}
                                    >Revenir à l'accueil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="zoom-vertical">
                        <div className="zoom-vertical-icon">
                            {/* Curseur pour changer la taille de la carte */}
                            <TbZoom size={24}/>
                        </div>

                        <input
                            className="zoom-vertical-range"
                            type={"range"}
                            min={20}
                            max={65}
                            onChange={(e) => definirRayon(Number(e.currentTarget.value))}
                        />

                        <div className="zoom-vertical-value">
                            {rayon}
                        </div>
                    </div>

                </main>

                {/* Affiche le bouton redémarrer seulement si la partie est finie */}
                {boutonRedemarrer()}
            </>
        );
    } else {
        return (
            <>
                {/* Bandeau de l'interface, titre du jeu */}
                <header className="container-fluid">
                    <h1 className="text-center">🐧/🥦 MASCOTTE HEX</h1>
                </header>

                <main className="container-fluid" style={{height: "calc(100vh - 4rem)"}}>
                    <div className="grid" style={{height: "100%"}}>
                        <div className="container">
                            {/* Partie de l'éditeur */}
                            <article>
                                <h3 className="text-center">🔧🗺️ EDITEUR DE CARTE</h3>
                                <br/>
                                <div className={"grid"}>
                                    <Link id="btnNouveau" href="/?show=true" role="button">Nouveau</Link>
                                    <Link id="btnModifier" href="/?showModif=true" role="button">Modifier</Link>
                                </div>

                                {/* Permet l'affichage des popups de création et de modification de cartes */}
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
                                <h3 className="text-center">👀🗺️ AFFICHAGE DE LA CARTE</h3>
                                <div style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    overflow: "auto"
                                }}>
                                    {hexagones.length > 0 && <GrilleEditeur
                                        rayon={rayon}
                                        hexagones={hexagones}
                                        mascotteInfo={residenceInfo}
                                        mascotteBio={residenceBio}
                                        rivieres={rivieres}
                                        tyroliennes={tyroliennes}
                                        onClick={(hex) => {
                                        }}
                                    />}
                                    <br/>
                                </div>
                            </article>

                        </div>
                        <div className="container" style={{display: "flex", flexDirection: "column", height: "100%"}}>
                            <article style={{flex: "0 0 auto"}}>
                                {/* Selection du mode de jeu */}
                                <h3 className="text-center">🎯⚔️ ENTRAINEMENT</h3>
                                <div className="container" style={{maxWidth: "420px", margin: "0 auto"}}>
                                    <select value={modeJeu}
                                            onChange={(mode) => definirModeJeu(mode.target.value as ModeJeu)}>
                                        <option value="" disabled>👉 CHOISIR MODE DE JEU</option>
                                        <option value="pvp">🆚 1 CONTRE 1</option>
                                        <option value="bot">🤖 CONTRE L'IA</option>
                                    </select>
                                </div>
                                {/* Si le mode de jeu joueur contre joueur a été selectionné */}
                                {modeJeu === "pvp" && (
                                    <>
                                        <hr/>
                                        {/* On choisit le premier joueur, info, bio ou choisis aléatoirement entre les deux */}
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
                                {/* Si le mode de jeu joueur contre robot a été selectionné */}
                                {modeJeu === "bot" && (
                                    <>
                                        <hr/>
                                        <h4>Choisir votre équipe</h4>
                                        <div role="group" style={{flexWrap: "wrap"}}>
                                            {/* On choisit qui est le joueur (humain), il commencera en premier */}
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
                                        {/* On choisit la difficulté de l'IA, facile par défaut */}
                                        <h4>Difficulté de l’IA</h4>
                                        <div
                                            role="group"
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                justifyContent: "center"
                                            }}
                                        >
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
                                                            flex: "1 1 200px",
                                                            maxWidth: "260px",
                                                            boxSizing: "border-box",
                                                            fontWeight: selected ? "bold" : undefined,
                                                            textDecoration: selected ? "underline" : undefined,
                                                            backgroundColor: v.bgColor,
                                                            color: "#000",
                                                            whiteSpace: "normal",
                                                        }}
                                                    >
                                                        {v.emoji} {v.key.toUpperCase()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            <div style={{display: "flex", justifyContent: "center", gap: "1rem"}}>
                                <Link id={"btnSelec"} href={"?showSelec=true"} role={"button"}>
                                    Choisir une carte
                                </Link>
                                {/* Lance le jeu si les conditions nécessaires sont réunies */}
                                <button onClick={demarrerJeu} disabled={!(modeJeu && premierTour && carteId)}>
                                    ▶️ Démarrer
                                </button>
                            </div>
                            </article>
                            {/* Boutons qui permettent de choisir une carte et de lancer une partie */}
                        </div>
                    </div>

                    {/* Permet l'affichage de la sélection des cartes */}
                    {showSelection &&
                        <GestionnaireModal prefixe={"/"} onCloseHref={"/"} restriction/>}
                </main>
            </>
        );
    }
}