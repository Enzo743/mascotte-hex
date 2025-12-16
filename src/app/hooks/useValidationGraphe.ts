import {useEffect, useState} from "react";
import {Arc, Carte, CarteJSON} from "@/app/temporaire/Interfaces";
import {TraitementCarte, TraitementGraphe} from "@/app/temporaire/Traitement";
import {plusCourtChemin} from "@/app/temporaire/Bot";

interface ValidationResult {
    estValide: boolean;
    graphe: Arc[] | null;
}

export function useValidationGraphe(
    jsonData: CarteJSON | null,
    rayon: number,
    posInfo: any,
    posBio: any
): ValidationResult {
    const [estValide, setEstValide] = useState<boolean>(false);
    const [graphe, setGraphe] = useState<Arc[] | null>(null);

    useEffect(() => {
        // Vérifie si les deux résidences sont placées
        if (!jsonData || !posInfo || !posBio) {
            console.log("Validation: Données manquantes", {jsonData: !!jsonData, posInfo, posBio});
            setEstValide(false);
            setGraphe(null);
            return;
        }

        // Fonction utilitaire pour extraire les coordonnées x/y depuis différents formats (Case ou {x,y})
        const getCoordonnees = (obj: any) => {
            if (!obj) return null;

            // Si c'est un objet Case, on extrait x et y depuis l'ID "x-y"
            if (typeof obj.id === 'string' && obj.id.includes('-')) {
                const [x, y] = obj.id.split('-').map(Number);
                return {x, y};
            }
            if (obj.coordonnees) return obj.coordonnees;
            if (typeof obj.x !== 'undefined' && typeof obj.y !== 'undefined') return obj;

            return null;
        };

        const coordInfo = getCoordonnees(posInfo);
        const coordBio = getCoordonnees(posBio);

        // Vérifie que les coordonnées existent
        if (!coordInfo || typeof coordInfo.x === 'undefined' || typeof coordInfo.y === 'undefined' ||
            !coordBio || typeof coordBio.x === 'undefined' || typeof coordBio.y === 'undefined') {
            console.log("Validation: Coordonnées invalides", {coordInfo, coordBio});
            setEstValide(false);
            setGraphe(null);
            return;
        }

        const carte: Carte = TraitementCarte(jsonData, rayon);

        // Crée des joueurs placées en dehors de la carte pour satisfaire la fonction TraitementGraphe
        const joueurInfo = {
            position: {
                x: -1,
                y: -1,
            },
            mascotte: false
        };

        const joueurBio = {
            position: {
                x: -1,
                y: -1
            },
            mascotte: false
        };

        const nouveauGraphe = TraitementGraphe(carte, [joueurInfo, joueurBio]);
        setGraphe(nouveauGraphe);

        // Vérifie s'il existe un chemin entre les deux résidences
        const cheminInfoVersBio = plusCourtChemin(
            nouveauGraphe,
            {x: coordInfo.x, y: coordInfo.y},
            {x: coordBio.x, y: coordBio.y},
            "extreme"
        );

        const cheminBioVersInfo = plusCourtChemin(
            nouveauGraphe,
            {x: coordBio.x, y: coordBio.y},
            {x: coordInfo.x, y: coordInfo.y},
            "extreme"
        );

        // La carte est valide si un chemin existe dans les deux sens
        const valide = cheminInfoVersBio !== null && cheminBioVersInfo !== null;
        setEstValide(valide);

    }, [jsonData, rayon, posInfo, posBio]);

    return {estValide, graphe};
}