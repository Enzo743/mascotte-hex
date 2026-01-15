// Dépendances
"use client";
import { useLogiqueJeu } from "@/app/logique/useLogiqueJeu";
import Lobby from "@/app/interfaces/Lobby";
import Jeu from "@/app/interfaces/Jeu";

export default function Home() {
    const logique = useLogiqueJeu();

    const actions = {
        demarrerJeu: logique.demarrerJeu,
        deplacerJoueur: logique.deplacerJoueur,
        utiliserCarte: logique.utiliserCarte,
        changerModeDeJeu: () => {
            // On remet à neuf les states quand on change de mode de jeu 
            logique.definirPremierTour("info");
            logique.definirBrouillard(false);
            logique.definirModeCarte(false);
            logique.definirDifficulteIA("facile");
        },
        // Si on appuie sur RETOUR, on recharge simplement la page pour réinitialiser tous les states
        quitter: () => {window.location.href = "/";}
    };

    if (logique.jeuDemarre && logique.contexte) {
        return <Jeu data={logique} actions={actions} />;
    }

    return <Lobby data={logique} actions={actions} />;
}