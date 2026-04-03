import {NextResponse} from "next/server";
import fs from "node:fs/promises";
import {estMemeTuile} from "@/app/utils/jsonUtils";
import {APISuppressionTuile} from "@/app/types/api";
import {CarteJSON, Connexion} from "@/app/modules/Interfaces";

/**
 * route → /api/cartes/supprimer
 * Route en POST qui supprime une tuile de la carte en fonction du type de connexion
 */
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const jsonReq: APISuppressionTuile = await req.json();
        const nom: string = jsonReq.nom;
        const type: string = jsonReq.type;
        const tuileSupprimee: [number, number] = jsonReq.tuileSupprimee;

        const data: string = await fs.readFile(`./public/json/${nom}.json`, "utf8");
        const json: CarteJSON = JSON.parse(data);

        switch (type) {
            case "tyrolienne": {
                const connexions: Connexion[] = json.connexions;

                json.connexions = connexions.filter((c: Connexion) => {
                    if (c.type !== "tyrolienne") return true;

                    const contient: boolean = c.tuiles.some((t: [number, number]): boolean => estMemeTuile(t, tuileSupprimee));

                    return !contient;
                });

                break;
            }
            case "riviere": {
                const connexions: Connexion[] = json.connexions;

                json.connexions = connexions.filter((c: Connexion) => {
                    if (c.type !== "riviere") return true;

                    const contient: boolean = c.tuiles.some((t: [number, number]): boolean => estMemeTuile(t, tuileSupprimee));

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