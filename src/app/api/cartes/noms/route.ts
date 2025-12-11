import fs from "node:fs/promises";
import {NextResponse} from "next/server";

export async function GET(req: Request) {
    try {
        const fichiers = await fs.readdir("./public/json");
        const tab: { nom: string, lignes: number, colonnes: number }[] = [];

        for (let i = 0; i < fichiers.length; i++) {
            const data = await fs.readFile(`./public/json/${fichiers[i]}`, "utf8");
            const json = JSON.parse(data);
            const jsonGrille = {
                "nom": fichiers[i].split(".")[0],
                "lignes": json.grille.lignes,
                "colonnes": json.grille.colonnes
            };

            tab.push(jsonGrille);
        }

        return NextResponse.json(tab);
    } catch (error) {
        return NextResponse.json({status: "error", error: error}, {status: 404});
    }
}