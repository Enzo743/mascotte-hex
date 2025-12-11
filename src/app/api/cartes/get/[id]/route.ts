import fs from "node:fs/promises";
import {NextResponse} from "next/server";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;

    try {
        const fileContent = await fs.readFile(`./public/json/${params.id}.json`, "utf8");
        const json = JSON.parse(fileContent);

        return NextResponse.json(json);
    } catch (error) {
        return NextResponse.json({status: "error", error: error}, {status: 404});
    }
}