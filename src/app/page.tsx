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
        quitter: () => {
            logique.router.push("/");
            logique.definirDifficulteIA("facile");
            logique.definirModeJeu("");
            logique.definirPremierTour(undefined);
            logique.definirJeuDemarre(false);
        }
    };

    if (logique.jeuDemarre && logique.contexte) {
        return <Jeu data={logique} actions={actions} />;
    }

    return <Lobby data={logique} actions={actions} />;
}