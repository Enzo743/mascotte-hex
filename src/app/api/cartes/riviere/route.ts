import {NextResponse} from "next/server";
import fs from "node:fs/promises";
import {estMemeTuile} from "@/app/utils/jsonUtils";

/**
 * route → /api/cartes/riviere
 * Route en POST qui regarde si une tuile est déjà incluse dans une rivière
 */
export async function POST(req: Request) {
    try {
        const jsonReq = await req.json();
        const nom = jsonReq.nom;
        const tuile = jsonReq.tuile;

        const data = await fs.readFile(`./public/json/${nom}.json`, "utf8");
        const json = JSON.parse(data);

        const presence = json.connexions.filter(c => c.type === "riviere").some(c => c.tuiles.some(t => estMemeTuile(t, tuile)));

        return NextResponse.json({status: "success"});
    } catch (error) {
        console.log(error);
        return NextResponse.json({status: "error", error: error});
    }
}