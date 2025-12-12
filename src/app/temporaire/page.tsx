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
                    mascotte: joueurInfo.mascotte
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
                    mascotte: joueurBio.mascotte
                });
                changerTour(0);
            }
        }
    }

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
}