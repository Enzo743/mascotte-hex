import fs from "node:fs/promises";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const json = JSON.stringify({
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