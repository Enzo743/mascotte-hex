import {NextResponse} from "next/server";
import fs from "node:fs/promises";
import {estMemeTuile} from "@/app/utils/jsonUtils";

/**
 * route → /api/cartes/tyrolienne
 * Route en POST qui regarde si une tuile est déjà incluse dans une tyrolienne
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
            c.type === "tyrolienne" && c.tuiles.some((t: any) => estMemeTuile(t, tuile))
        );
        const presence = !!connexion;

        if (connexion) {
            const index = connexion.tuiles.findIndex((t: any) => estMemeTuile(t, tuile));

            if (index === 0) {
                position = "debut";
            } else if (index === 1) {
                position = "fin";
            }
        }

        return NextResponse.json({statusTyrolienne: "success", presenceTyrolienne: presence, positionTyrolienne: position, tuiles:connexion.tuiles});
    } catch (error) {
        console.log(error);
        return NextResponse.json({statusTyrolienne: "error", errorTyrolienne: error});
    }
}