"use client";
import Link from "next/link";
import LigneGestionnaire from "./LigneGestionnaire";
import { useState, useEffect } from "react";
import React from "react";

interface GestionnaireModalHref {
    prefixe : string;
}

const GestionnaireModal: React.FC<GestionnaireModalHref> = ({prefixe}) => {

    const [cartes, setCartes] = useState([]);

    useEffect(() => {
        async function chargerDonnees() {
            try {
                const reponse = await fetch("/api/cartes/noms");
                const donnees = await reponse.json();
                console.log(donnees);
                setCartes(donnees);
            } catch (error) {
                console.error("Erreur de chargement:", error);
            }
        }
        chargerDonnees();
    }, []);

    return (
        <dialog open>
            <article>
                <header>
                    <Link href="/editeur" aria-label="Close" className="close link-message-modal"/>
                    <h3 style={{textAlign: 'center', margin: 0}}>Gestionnaire des cartes</h3>
                </header>
                <main>
                    <div className="col-titres">
                        <span className="col-nom">Nom du fichier</span>
                        <span className="col-infos">
                            <span className="col-lignes">Lignes</span>
                            <span className="col-colonnes">Colonnes</span>
                        </span>
                    </div>
                    {cartes.map((carte) => (
                        <LigneGestionnaire
                            key = {carte.nom}
                            nomFichier = {carte.nom}
                            lignes = {carte.lignes}
                            colonnes = {carte.colonnes}
                            href = {`${prefixe}?id=${carte.nom}`}
                        />
                    ))}
                </main>
            </article>
        </dialog>

    );
}

export default GestionnaireModal;