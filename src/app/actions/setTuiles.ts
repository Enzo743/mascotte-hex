import {APITuileCollection} from "@/app/types/api";

export async function setTuiles(collection: string): Promise<Response> {
    const json: APITuileCollection = JSON.parse(collection) as APITuileCollection;

    // console.log(json);

    const tuiles: string = JSON.stringify({
        nom: json.nom,
        info: json?.info,
        bio: json?.bio,
        montagne: json?.montagne,
        foret: json?.foret,
        ocean: json?.ocean,
        plaine: json?.plaine,
        tyrolienne: json?.tyrolienne,
        riviere: json?.riviere,
    });

    // console.log(tuiles);

    const response: Response = await fetch("/api/cartes/ajouter/", {
        method: "POST",
        body: tuiles,
    });

    return await response.json();
}