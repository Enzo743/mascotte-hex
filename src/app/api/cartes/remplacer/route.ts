import fs from "node:fs/promises";
import {NextResponse} from "next/server";

/**
 * route → /api/cartes/remplacer
 * Route en POST qui remplace l'intégralité d'un fichier JSON
 */
export async function POST(req: Request) {
    try {
        const jsonReq = await req.json();
        const nom = jsonReq.nom;
        const data = jsonReq.data;

        if (!nom || !data) {
            return NextResponse.json({status: "error", error: "Nom ou données manquantes"}, {status: 400});
        }

        await fs.writeFile(`./public/json/${nom}.json`, JSON.stringify(data, null, 2), "utf8");

        return NextResponse.json({status: "success"});
    } catch (error) {
        console.error("Erreur remplacement carte:", error);
        return NextResponse.json({status: "error", error: String(error)}, {status: 500});
    }
}