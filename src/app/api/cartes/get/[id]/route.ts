import fs from "node:fs/promises";
import {NextResponse} from "next/server";
import {CarteJSON} from "@/app/modules/Interfaces";

/**
 * route → /api/cartes/get/[id] où [id] est le nom de la carte
 * Route en GET qui prend un nom de carte et renvoie le fichier JSON correspondant
 */
export async function GET(context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    const params: { id: string } = await context.params;

    try {
        const fileContent: string = await fs.readFile(`./public/json/${params.id}.json`, "utf8");
        const json: CarteJSON = JSON.parse(fileContent) as CarteJSON;

        return NextResponse.json(json);
    } catch (error) {
        return NextResponse.json({status: "error", error: error}, {status: 404});
    }
}