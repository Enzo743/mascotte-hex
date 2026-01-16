// Dépendances
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCarte } from "@/app/actions/getCarte";
import { cheminRandom, plusCourtChemin } from "@/app/modules/Bot";
import { TraitementCarte, TraitementGraphe, TraitementTotal } from "@/app/modules/Traitement";
// Voir @1
// import { Terrain } from "@/app/components/Terrain";
import { Arc, Case, CarteJSON, Contexte, DifficulteIA, Joueur, ModeJeu, Noeud, Pioche, Position, PremierTour, CarteAJouer, Connexion} from "@/app/modules/Interfaces";
import { cp } from "node:fs";

/* === useLogiqueJeu ===
Todo : Commenter TOUT, fin histoire qu'on puisse un peu comprendre
*/
export function useLogiqueJeu() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const carteId = searchParams.get("id");
    const showSelection = searchParams.get("showSelec");
    const showVictoire = searchParams.get("showVict");
    const show = searchParams.get("show");
    const showModification = searchParams.get("showModif");

    const [indexCarte, setIndexCarte] = useState(0);
    // Voir @1
    // const [carteJSONvisu, definirCarteJSONvisu] = useState<CarteJSON | null>(null);
    const [hexagones, definirHexagones] = useState<Case[]>([]);
    const [residenceInfo, definirResidenceInfo] = useState<Case | undefined>(undefined);
    const [residenceBio, definirResidenceBio] = useState<Case | undefined>(undefined);
    const [tyroliennes, definirTyroliennes] = useState<Connexion[]>([]);
    const [rivieres, definirRivieres] = useState<Connexion[]>([]);
    const [contexte, definirContexte] = useState<Contexte | undefined>(undefined);
    const [rayon, definirRayon] = useState<number>(60);
    const [carteJSON, definirCarteJSON] = useState<CarteJSON | null>(null);
    const [modeJeu, definirModeJeu] = useState<ModeJeu | undefined>("");
    const [premierTour, definirPremierTour] = useState<PremierTour | undefined>("info");
    const [difficulteIA, definirDifficulteIA] = useState<DifficulteIA>("facile");
    const [brouillard, definirBrouillard] = useState<boolean>(false);
    const [modeCarte, definirModeCarte] = useState<boolean>(false);
    const [equipe, definirEquipe] = useState<boolean>(false);
    const [jeuDemarre, definirJeuDemarre] = useState<boolean>(false);
    const [tour, changerTour] = useState<number>(0);
    const [pion, definirPion] = useState<number>(0);
    const [pioche, definirPioche] = useState<Pioche>(new Pioche());
    const [piocheInfo, setPiocheInfo] = useState<CarteAJouer[]>([]);
    const [piocheBio, setPiocheBio] = useState<CarteAJouer[]>([]);
    const [victoire, definirVictoire] = useState<"Info" | "Bio" | null>(null);
    const [surveillants, definirSurveillants] = useState<Position[]>([]);
    const [castors, definirCastors] = useState<Position[]>([]);
    const [casse, definirCasse] = useState<Position[]>([]);

    // Description des cartes à jouer, en fonction de leur indice
    const descriptionCartes = [
        "Place un enseignant sur une case, interdisant le passage sur cette case et les cases voisines.", // 
        "Fait disparaître un enseignant présent sur le plateau, libérant le passage pour tous les joueurs.",
        "Permet de construire un barrage sur une case rivière, bloquant tout déplacement en radeau sur cette case.",
        "Facilite la destruction d'un barrage construit par un autre, rendant le chemin accessible à nouveau.",
        "Permet de détruire le point de départ d'une tyrolienne, rendant son utilisation impossible pour tous.",
        "Permet de réparer une tyrolienne détruite, rétablissant ainsi son point de départ.",
    ];

    // Utile (par la suite) pour l'affichage des boutons tyrolienne et riviere
    const joueurActuel = tour === 0 
        ? (pion === 0 ? contexte?.joueurInfo : contexte?.joueurInfo2) 
        : (pion === 0 ? contexte?.joueurBio : contexte?.joueurBio2);
    const caseActuelle = contexte?.carte.cases.find(c => 
        c.positionMatrice.x === joueurActuel?.position.x && 
        c.positionMatrice.y === joueurActuel?.position.y
    );

    /* @1 === Commenté, en attendant de potentiellement le retravailler (erreurs de type) ===
    async function showCarteVisu() {
        if (carteId && residenceBio !== null && residenceInfo !== null) {
            const carte: CarteJSON = await getCarte(carteId);
            if (!carte || !carte.résidences) return;
            definirCarteJSONvisu(carte);
            const coordResidenceInfo = carte.résidences.info;
            const coordResidenceBio = carte.résidences.bio;
            const idResidenceInfo = `${coordResidenceInfo[0]}-${coordResidenceInfo[1]}`;
            const idResidenceBio = `${coordResidenceBio[0]}-${coordResidenceBio[1]}`;
            const hex = Terrain(carte, rayon);
            const resInfo = hex.find(h => h.id === idResidenceInfo);
            const resBio = hex.find(h => h.id === idResidenceBio);
            const tyrol = carte.connexions.filter(c => c.type === "tyrolienne");
            const riv = carte.connexions.filter(c => c.type === "riviere");
            definirHexagones(hex);
            definirResidenceBio(resBio);
            definirResidenceInfo(resInfo);
            definirTyroliennes(tyrol);
            definirRivieres(riv);
        }
    }
    */

    const deplacerJoueur = useCallback((position: Position) => {
        if (tour === 5 || tour === 6) {
            definirSurveillants(prev => [...prev, position]);
            tour === 5 ? changerTour(0) : changerTour(1);
            return;
        }
        else if (tour === 7 || tour === 8) {
            definirSurveillants(prev => prev.filter(p => !(p.x === position.x && p.y === position.y)));
            tour === 7 ? changerTour(0) : changerTour(1);
            return;
        }
        if (modeJeu == "bot" && ((premierTour === "info" && tour === 1) || (premierTour === "bio" && tour === 0))) return;
        if (tour > 1) return;
        if (contexte) {
            let joueurActuel: Joueur;
            if (equipe) {
                joueurActuel = tour === 0 ? (pion == 0 ? contexte.joueurInfo : contexte.joueurInfo2) : (pion == 0 ? contexte.joueurBio : contexte.joueurBio2);
            } else {
                joueurActuel = tour === 0 ? contexte.joueurInfo : contexte.joueurBio;
            }
            const arc: Arc | undefined = contexte.graphe.find(g =>
                g.noeud.x === joueurActuel.position.x &&
                g.noeud.y === joueurActuel.position.y
            );
            if (arc && arc.voisins.some(v => v.x === position.x && v.y === position.y)) {
                if (tour === 0) {
                    if (pion === 0) {
                        contexte.joueurInfo.position = position;
                        contexte.joueurInfo.mascotte = ((position.x === contexte.carte.residenceBio.x) && (position.y === contexte.carte.residenceBio.y) && !contexte.joueurInfo2.mascotte) ? true : contexte.joueurInfo.mascotte;
                    } else {
                        contexte.joueurInfo2.position = position;
                        contexte.joueurInfo2.mascotte = ((position.x === contexte.carte.residenceBio.x) && (position.y === contexte.carte.residenceBio.y) && !contexte.joueurInfo.mascotte) ? true : contexte.joueurInfo2.mascotte;
                    }
                } else {
                    if (pion === 0) {
                        contexte.joueurBio.position = position;
                        contexte.joueurBio.mascotte = ((position.x === contexte.carte.residenceInfo.x) && (position.y === contexte.carte.residenceInfo.y) && !contexte.joueurBio2.mascotte) ? true : contexte.joueurBio.mascotte;
                    } else {
                        contexte.joueurBio2.position = position;
                        contexte.joueurBio2.mascotte = ((position.x === contexte.carte.residenceInfo.x) && (position.y === contexte.carte.residenceInfo.y) && !contexte.joueurBio.mascotte) ? true : contexte.joueurBio2.mascotte;
                    }
                }
                tourSuivant();
            }
        }
    }, [contexte, tour, pion, equipe, modeJeu, premierTour, carteId]);

    const utiliserTyrolienne = useCallback(() => {
        if (!contexte) return;
        const joueurActuel: Joueur = tour === 0 ? (pion == 0 ? contexte.joueurInfo : contexte.joueurInfo2) : (pion == 0 ? contexte.joueurBio : contexte.joueurBio2);
        const emplacement: Case | undefined = contexte.carte.cases.find(c =>
            c.positionMatrice.x === joueurActuel.position.x &&
            c.positionMatrice.y === joueurActuel.position.y
        );
        if (emplacement && emplacement.tyrolienne.nombre > 0) {
            deplacerJoueur(emplacement.tyrolienne.sorties[Math.floor(Math.random() * emplacement.tyrolienne.nombre)]);
        }
    }, [contexte, tour, pion, deplacerJoueur]);

    const utiliserRiviere = useCallback(() => {
        if (!contexte) return;
        const joueurActuel: Joueur = tour === 0 ? (pion == 0 ? contexte.joueurInfo : contexte.joueurInfo2) : (pion == 0 ? contexte.joueurBio : contexte.joueurBio2);
        const emplacement: Case | undefined = contexte.carte.cases.find(c =>
            c.positionMatrice.x === joueurActuel.position.x &&
            c.positionMatrice.y === joueurActuel.position.y
        );
        if (emplacement && emplacement.riviere.nombre > 0) {
            deplacerJoueur(emplacement.riviere.sorties[Math.floor(Math.random() * emplacement.riviere.nombre)]);
        }
    }, [contexte, tour, pion, deplacerJoueur]);

    function tourSuivant() {
        if (contexte) {
            if (tour === 0) {
                if (contexte.joueurInfo.position.x === contexte.carte.residenceInfo.x &&
                    contexte.joueurInfo.position.y === contexte.carte.residenceInfo.y &&
                    contexte.joueurInfo.mascotte ||
                    contexte.joueurInfo2.position.x === contexte.carte.residenceInfo.x &&
                    contexte.joueurInfo2.position.y === contexte.carte.residenceInfo.y &&
                    contexte.joueurInfo2.mascotte) {
                    changerTour(2);
                    definirVictoire("Info");
                    router.push(`/?id=${carteId}&showVict=true`);
                    return;
                }
            } else if (tour === 1) {
                if (contexte.joueurBio.position.x === contexte.carte.residenceBio.x &&
                    contexte.joueurBio.position.y === contexte.carte.residenceBio.y &&
                    contexte.joueurBio.mascotte ||
                    contexte.joueurBio2.position.x === contexte.carte.residenceBio.x &&
                    contexte.joueurBio2.position.y === contexte.carte.residenceBio.y &&
                    contexte.joueurBio2.mascotte) {
                    changerTour(3);
                    definirVictoire("Bio");
                    router.push(`/?id=${carteId}&showVict=true`);
                    return;
                }
            }
            const prochainTour = tour === 0 ? 1 : 0;
            changerTour(prochainTour);
            contexte.graphe = TraitementGraphe(contexte.carte, contexte.joueurInfo, contexte.joueurBio, contexte.joueurInfo2, contexte.joueurBio2, tour, equipe, surveillants, castors, casse);
        }
    }

    function deplacerIA() {
        if (!contexte) return;
        const iaInfo = modeJeu === "bot" && premierTour === "bio";
        const joueurIA = iaInfo ? contexte.joueurInfo : contexte.joueurBio;
        const joueurHumain = iaInfo ? contexte.joueurBio : contexte.joueurInfo;
        let prochainePosition;
        if (difficulteIA == "stupide") {
            prochainePosition = cheminRandom(contexte.graphe, joueurIA.position);
        } else {
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
            const arriveeBloquee = joueurHumain.position.x === arrivee.noeud.x && joueurHumain.position.y === arrivee.noeud.y;
            if (arriveeBloquee) {
                const chemins: Noeud[][] = [];
                arrivee.voisins.forEach(voisin => {
                    const c = plusCourtChemin(contexte.graphe, joueurIA.position, voisin, difficulteIA);
                    if (c) chemins.push(c);
                });
                if (chemins.length === 0) return;
                chemin = chemins.reduce((a, b) => (a.length < b.length ? a : b));
            } else {
                chemin = plusCourtChemin(contexte.graphe, joueurIA.position, arrivee.noeud, difficulteIA);
            }
            if (!chemin || chemin.length < 2) return;
            prochainePosition = chemin[1];
        }
        if (!prochainePosition) return null;
        const joueurIAUpdate: Joueur = {
            ...joueurIA,
            position: prochainePosition,
            mascotte: joueurIA.mascotte || (prochainePosition.x === (iaInfo ? contexte.carte.residenceBio.x : contexte.carte.residenceInfo.x) && prochainePosition.y === (iaInfo ? contexte.carte.residenceBio.y : contexte.carte.residenceInfo.y))
        };
        const nouveauContexte: Contexte = {
            ...contexte,
            joueurInfo: iaInfo ? joueurIAUpdate : contexte.joueurInfo,
            joueurBio: !iaInfo ? joueurIAUpdate : contexte.joueurBio
        };
        const resAdverse = iaInfo ? nouveauContexte.carte.residenceInfo : nouveauContexte.carte.residenceBio;
        if (joueurIAUpdate.mascotte && joueurIAUpdate.position.x === resAdverse.x && joueurIAUpdate.position.y === resAdverse.y) {
            definirContexte(nouveauContexte);
            changerTour(iaInfo ? 2 : 3);
            definirVictoire(iaInfo ? "Info" : "Bio");
            router.push(`/?id=${carteId}&showVict=true`);
            return;
        }
        definirContexte(nouveauContexte);
        changerTour(t => (t === 0 ? 1 : 0));
    }

    async function demarrerJeu() {
        if (modeJeu && premierTour && carteId) {
            const estEquipe = modeJeu === "tvt";
            if (brouillard) definirDifficulteIA("stupide");
            definirEquipe(estEquipe);
            const carte = await getCarte(carteId);
            definirCarteJSON(carte);
            const nouveauContexte = TraitementTotal(carte, rayon, tour, estEquipe, surveillants, castors, casse);
            definirContexte(nouveauContexte);
            const tourDepart = (premierTour === "random") ? Math.floor(Math.random() * 2) : (premierTour === "info" ? 0 : 1);
            changerTour(tourDepart);
            definirJeuDemarre(true);
            const nouvellePioche = new Pioche();
            nouvellePioche.ajouter([0, "🥸 Surveillant"]);
            nouvellePioche.ajouter([0, "🥸 Surveillant"]);
            for (let i = 0; i < 3; i++) {
                nouvellePioche.ajouter([3, "🚜 Budlozer"]);
                nouvellePioche.ajouter([4, "✂️ Tenaille"]);
            }
            for (let i = 0; i < 4; i++) nouvellePioche.ajouter([1, "📄 Corrections"]);
            for (let i = 0; i < 5; i++) nouvellePioche.ajouter([2, "🦫 Castor"]);
            for (let i = 0; i < 7; i++) nouvellePioche.ajouter([5, "🪢 Corde"]);
            nouvellePioche.melanger();
            const pInfo: CarteAJouer[] = [];
            const pBio: CarteAJouer[] = [];
            for (let i = 0; i < 3; i++) {
                pInfo.push(nouvellePioche.piocher());
                pBio.push(nouvellePioche.piocher());
            }
            definirPioche(nouvellePioche);
            setPiocheInfo(pInfo);
            setPiocheBio(pBio);
        }
    }

    function utiliserCarte(info: boolean, position: number) {
        const carte: CarteAJouer = info ? piocheInfo[position] : piocheBio[position];
        if (carte) {
            if (carte[0] === 0) {
                info ? changerTour(5) : changerTour(6);
            } else if (carte[0] === 1) {
                info ? changerTour(7) : changerTour(8);
            } else if (carte[0] === 2) {
                if (caseActuelle && caseActuelle.riviere.nombre > 0) {
                    if (!castors.some(c => c.x === caseActuelle.positionMatrice.x && c.y === caseActuelle.positionMatrice.y)) definirCastors(prev => [...prev, caseActuelle.positionMatrice]);
                }
            } else if (carte[0] === 3) {
                definirCastors(prev => prev.filter(p => !(p.x === joueurActuel?.position.x && p.y === joueurActuel?.position.y)));
            } else if (carte[0] == 4) {
                if (caseActuelle && caseActuelle.tyrolienne.nombre > 0) {
                    if (!casse.some(c => c.x === caseActuelle.positionMatrice.x && c.y === caseActuelle.positionMatrice.y)) definirCasse(prev => [...prev, caseActuelle.positionMatrice]);
                }
            } else if (carte[0] === 5) {
                if (caseActuelle && caseActuelle.tyrolienne.nombre > 0) {
                    definirCasse(prev => prev.filter(p => !(p.x === joueurActuel?.position.x && p.y === joueurActuel?.position.y)));
                }
            }
        }
        if (info && tour === 0) {
            setPiocheInfo(prev => {
                const copie = [...prev];
                pioche.ajouter(copie[position]);
                copie[position] = pioche.piocher();
                return copie;
            });
        } else if (!info && tour === 1) {
            setPiocheBio(prev => {
                const copie = [...prev];
                pioche.ajouter(copie[position]);
                copie[position] = pioche.piocher();
                return copie;
            });
        }
    }

    useEffect(() => {
        let emoji = "";
        if (tour === 5 || tour === 6) {
            emoji = "🥸"; // Surveillant
        } else if (tour === 7 || tour === 8) {
            emoji = "📄";
        }
        if (emoji !== "") {
            const svgEmoji = `
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
                    <text 
                        x="50%" 
                        y="50%" 
                        font-size="50"
                        text-anchor="middle" 
                        dominant-baseline="central"
                    >${emoji}</text>
                </svg>
            `;
            const url = `data:image/svg+xml;utf8,${encodeURIComponent(svgEmoji)}`;
            document.body.style.cursor = `url('${url}') 32 32, auto`;
        } else {
            document.body.style.cursor = 'auto';
        }
        return () => {
            document.body.style.cursor = 'auto';
        };
    }, [tour]);

    useEffect(() => {
        const empecherMenu = (event: MouseEvent) => event.preventDefault();
        const clic = (event: MouseEvent) => {
            if (jeuDemarre && equipe && event.button === 2) {
                definirPion((precedent) => (precedent === 0 ? 1 : 0));
            }
        };
        document.addEventListener("contextmenu", empecherMenu);
        document.addEventListener("mousedown", clic);
        return () => {
            document.removeEventListener("contextmenu", empecherMenu);
            document.removeEventListener("mousedown", clic);
        };
    }, [jeuDemarre, equipe]);

    useEffect(() => {
        const touche = (event: KeyboardEvent) => {
            if (event.key === "t") utiliserTyrolienne();
            else if (event.key === "r") utiliserRiviere();
        };
        document.addEventListener("keydown", touche);
        return () => document.removeEventListener("keydown", touche);
    }, [utiliserTyrolienne, utiliserRiviere]);

    useEffect(() => {
        let interval: number | null = null;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (!interval) interval = window.setInterval(() => definirRayon(r => Math.min(r + 1, 100)), 50);
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (!interval) interval = window.setInterval(() => definirRayon(r => Math.max(r - 1, 10)), 50);
            }
        };
        const onKeyUp = () => {
            if (interval) { clearInterval(interval); interval = null; }
        };
        window.addEventListener("keydown", onKeyDown, { passive: false });
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            if (interval) clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (!carteJSON) return;
        if (contexte) contexte.carte = TraitementCarte(carteJSON, rayon);
    }, [rayon, carteJSON, contexte]);

    useEffect(() => {
        if (!contexte || modeJeu !== "bot") return;
        const tourIA = premierTour === "info" ? 1 : 0;
        if (tour === tourIA) deplacerIA();
    }, [tour, contexte, modeJeu, premierTour]);

    /* Voir @1 
    useEffect(() => {
        if (carteId) showCarteVisu();
    }, [carteId, rayon]);
    */

    return {
        carteId, showSelection, showVictoire, show, showModification,
        indexCarte, setIndexCarte, hexagones, residenceInfo, residenceBio,
        tyroliennes, rivieres, contexte, rayon, modeJeu, definirModeJeu,
        premierTour, definirPremierTour, difficulteIA, definirDifficulteIA,
        brouillard, definirBrouillard, modeCarte, definirModeCarte,
        equipe, jeuDemarre, definirJeuDemarre, tour, pion, piocheInfo, 
        piocheBio, victoire, descriptionCartes, demarrerJeu, 
        deplacerJoueur, utiliserCarte, utiliserTyrolienne, 
        utiliserRiviere, router, definirVictoire, caseActuelle, surveillants, definirSurveillants, castors, definirCastors,
        casse, definirCasse
    };
}