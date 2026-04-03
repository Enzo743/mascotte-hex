import fs from "node:fs/promises";
import {NextResponse} from "next/server";
import {CarteJSON} from "@/app/modules/Interfaces";

/**
 * route → /api/cartes/noms
 * Renvoie un fichier JSON comprenant l'ensemble des noms de cartes existants et leurs tailles respectives
 */
export async function GET(): Promise<NextResponse> {
    try {
        const cheminDossier: string = "./public/json";
        const fichiers: string[] = await fs.readdir(cheminDossier);
        const tab: { nom: string, lignes: number, colonnes: number }[] = [];

        for (let i: number = 0; i < fichiers.length; i++) {
            if (fichiers[i].startsWith('.')) continue;

            const data: string = await fs.readFile(`${cheminDossier}/${fichiers[i]}`, "utf8");
            const json: CarteJSON = JSON.parse(data) as CarteJSON;
            const jsonGrille: { nom: string; lignes: number; colonnes: number } = {
                "nom": fichiers[i].split(".")[0],
                "lignes": json.grille.lignes,
                "colonnes": json.grille.colonnes
            };

            tab.push(jsonGrille);
        }

        return NextResponse.json(tab);
    } catch (error) {
        console.error("Erreur dans /api/cartes/noms:", error);
        return NextResponse.json(
            {status: "error", message: error instanceof Error ? error.message : String(error)},
            {status: 500}
        );
    }
}