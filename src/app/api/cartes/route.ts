import fs from "node:fs/promises";
import {NextResponse} from "next/server";

/**
 * route → /api/cartes/
 * Route en POST prenant dans le formulaire un nom, un nombre de lignes et de colonnes et enregistrant le fichier JSON correspondant dans le dossier public/json/
 */
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const formData: FormData = await req.formData();
        const json: string = JSON.stringify({
            "grille": {
                "lignes": formData.get("lignes"),
                "colonnes": formData.get("colonnes")
            },
            "résidences": {},
            "terrains": {
                "plaine": [],
                "foret": [],
                "montagne": []
            },
            "connexions": []
        });

        await fs.writeFile(`./public/json/${formData.get("nom")}.json`, json);

        return NextResponse.json({status: "success"});
    } catch (error) {
        return NextResponse.json({status: "error", error: error});
    }
}