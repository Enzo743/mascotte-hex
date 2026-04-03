import {NextResponse} from "next/server";
import fs from "node:fs/promises";
import {estMemeTuile} from "@/app/utils/jsonUtils";
import {APIRiviere} from "@/app/types/api";
import {CarteJSON, Connexion} from "@/app/modules/Interfaces";

/**
 * route → /api/cartes/riviere
 * Route en POST qui regarde si une tuile est déjà incluse dans une rivière
 */
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const jsonReq: APIRiviere = await req.json();
        const nom: string = jsonReq.nom;
        const tuile: [number, number] = jsonReq.tuile;

        const data: string = await fs.readFile(`./public/json/${nom}.json`, "utf8");
        const json: CarteJSON = JSON.parse(data) as CarteJSON;

        let position: string | null = null;

        const connexion: Connexion | undefined = json.connexions.find((c: Connexion): boolean =>
            c.type === "riviere" && c.tuiles.some((t: [number, number]): boolean => estMemeTuile(t, tuile))
        );
        const presence: boolean = !!connexion;

        if (connexion) {
            const index: number = connexion.tuiles.findIndex((t: [number, number]): boolean => estMemeTuile(t, tuile));
            const longueur: number = connexion.tuiles.length;

            if (index === 0) {
                position = "debut";
            } else if (index === longueur - 1) {
                position = "fin";
            } else {
                position = "milieu";
            }
        }

        return NextResponse.json({statusRiviere: "success", presenceRiviere: presence, positionRiviere: position});
    } catch (error) {
        console.log(error);
        return NextResponse.json({statusRiviere: "error", errorRiviere: error});
    }
}