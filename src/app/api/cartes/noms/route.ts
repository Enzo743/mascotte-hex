import fs from "node:fs/promises";
import {NextResponse} from "next/server";

/**
 * route → /api/cartes/noms
 * Renvoie un fichier JSON comprenant l'ensemble des noms de cartes existants et leurs tailles respectives
 */
export async function GET(req: Request) {
    try {
        const cheminDossier: string = "./public/json";
        const fichiers: string[] = await fs.readdir(cheminDossier);
        const tab: { nom: string, lignes: number, colonnes: number }[] = [];

        for (let i = 0; i < fichiers.length; i++) {
            if (fichiers[i].startsWith('.')) continue;

            const data: string = await fs.readFile(`${cheminDossier}/${fichiers[i]}`, "utf8");
            const json: any = JSON.parse(data);
            const jsonGrille: { nom: string; lignes: any; colonnes: any } = {
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
            {status: "error", message: error.message},
            {status: 500}
        );
    }
}