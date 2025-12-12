// Dépendances
"use client";
import {Affichage} from "./Affichage";
import {CarteJSON, Contexte} from "./Interfaces";
import {useEffect, useState} from "react";
import {TraitementTotal} from "./Traitement";
import carteBrute from "./carte.json" assert {type: "json"};
const carteJSON: CarteJSON = carteBrute as CarteJSON;

export default function Home() {
    const [rayon, definirRayon] = useState(60);
    const [contexte, setContexte] = useState<Contexte>(TraitementTotal(carteJSON, rayon));

    useEffect(() => {
        setContexte(TraitementTotal(carteJSON, rayon));
    }, [rayon]);

    return (
        <>
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
                contexte = {contexte}
                rayon = {rayon}
            />
        </>
    );
}