// Dépendances
"use client";
import { useState } from "react";
import Grille from "./components/Grille";
import carte1 from "./carte1.json";
import { Jeu } from "./components/Jeu";

export default function Home() {
    // Initialisation de la partie
    const [partie] = useState(() => new Jeu(carte1, 40));

    // Etats des éléments pouvant être déplacés
    const [posInfo, setPosInfo] = useState(partie.mascotteInfo);
    const [posBio, setPosBio] = useState(partie.mascotteBio);
    const [posJoueur, setPosJoueur] = useState(partie.joueur);

    return (
        <>
            {/* Appel de la Grille */}
            <Grille
                rayon = {partie.rayon}
                hexagones = {partie.hexagones}
                joueur = {partie.position(posJoueur)}
                ennemi = {partie.position(partie.ennemi)}
                mascotteInfo = {partie.position(posInfo)}
                mascotteBio = {partie.position(posBio)}
                rivieres = {partie.rivieres}
                tyroliennes = {partie.tyroliennes}
                deplacement = {(position) => setPosJoueur(position)}
            />
        </>
    );
}