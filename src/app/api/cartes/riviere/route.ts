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

        let position = null;

        const connexion = json.connexions.find((c: any) =>
            c.type === "riviere" && c.tuiles.some((t: any) => estMemeTuile(t, tuile))
        );
        const presence = !!connexion;

        if (connexion) {
            const index = connexion.tuiles.findIndex((t: any) => estMemeTuile(t, tuile));
            const longueur = connexion.tuiles.length;

            if (index === 0) {
                position = "debut";
            } else if (index === longueur - 1) {
                position = "fin";
            } else {
                position = "milieu";
            }
        }

        return NextResponse.json({status: "success", presence: presence, position: position});
    } catch (error) {
        console.log(error);
        return NextResponse.json({status: "error", error: error});
    }
}