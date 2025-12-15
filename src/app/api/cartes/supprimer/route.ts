import {NextResponse} from "next/server";
import fs from "node:fs/promises";
import {estMemeTuile} from "@/app/utils/jsonUtils";

/**
 * route → /api/cartes/supprimer
 * Route en POST qui supprime une tuile de la carte en fonction du type de connexion
 */
export async function POST(req: Request) {
    try {
        const jsonReq = await req.json();
        const nom = jsonReq.nom;
        const type = jsonReq.type;
        const tuileSupprimee = jsonReq.tuileSupprimee;

        const data = await fs.readFile(`./public/json/${nom}.json`, "utf8");
        const json = JSON.parse(data);

        switch (type) {
            case "tyrolienne": {
                const connexions = json.connexions;

                json.connexions = connexions.filter(c => {
                    if (c.type !== "tyrolienne") return true;

                    const contient = c.tuiles.some((t) => estMemeTuile(t, tuileSupprimee));

                    return !contient;
                });

                break;
            }
            case "riviere": {
                const connexions = json.connexions;

                json.connexions = connexions.filter(c => {
                    if (c.type !== "riviere") return true;

                    const contient = c.tuiles.some((t) => estMemeTuile(t, tuileSupprimee));

                    return !contient;
                });

                break;
            }
            default: {
                return NextResponse.json({status: "error", error: "Type inconnu"});
            }
        }

        await fs.writeFile(`./public/json/${nom}.json`, JSON.stringify(json, null, 2));

        return NextResponse.json({status: "success"});
    } catch (error) {
        return NextResponse.json({status: "error", error: error});
    }
}