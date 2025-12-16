"use client";
import Link from "next/link";
import LigneGestionnaire from "../LigneGestionnaire";
import React, {useEffect, useState} from "react";

interface GestionnaireModalHref {
    prefixe: string;
    onCloseHref: string;
    restriction?: boolean;
}

const GestionnaireModal: React.FC<GestionnaireModalHref> = ({prefixe, onCloseHref, restriction}) => {

    const [cartes, setCartes] = useState<any[]>([]);

    useEffect(() => {
        async function chargerDonnees() {
            try {
                const reponse = await fetch("/api/cartes/noms");
                const donnees = await reponse.json();
                console.log(donnees);

                if (Array.isArray(donnees)) {
                    setCartes(donnees);
                } else {
                    console.error("Erreur API:", donnees);
                    setCartes([]);
                }
            } catch (error) {
                console.error("Erreur de chargement:", error);
                setCartes([]);
            }
        }

        chargerDonnees();
    }, []);

    // Permet de n'afficher que les cartes valides, et de les trier par nom
    const cartesValides = cartes.filter(carte => !carte.nom.startsWith("invalide-"));

    return (
        <dialog open>
            <article>
                <header>
                    <Link href={onCloseHref} aria-label="Close" className="close link-message-modal"/>
                    <h3 style={{textAlign: 'center', margin: 0}}>Gestionnaire des cartes</h3>
                </header>
                <main className={"overflow-auto"}>
                    <div className="col-titres">
                        <span className="col-nom">Nom du fichier</span>
                        <span className="col-infos">
                            <span className="col-lignes">Lignes</span>
                            <span className="col-colonnes">Colonnes</span>
                        </span>
                    </div>
                    {restriction && cartesValides.map((carte) => (
                        <LigneGestionnaire
                            key={carte.nom}
                            nomFichier={carte.nom}
                            lignes={carte.lignes}
                            colonnes={carte.colonnes}
                            href={`${prefixe}?id=${carte.nom}`}
                        />
                    ))}

                    {!restriction && cartes.map((carte) => (
                        <LigneGestionnaire
                            key={carte.nom}
                            nomFichier={carte.nom}
                            lignes={carte.lignes}
                            colonnes={carte.colonnes}
                            href={`${prefixe}?id=${carte.nom}`}
                        />
                    ))}
                </main>
            </article>
        </dialog>

    );
}

export default GestionnaireModal;