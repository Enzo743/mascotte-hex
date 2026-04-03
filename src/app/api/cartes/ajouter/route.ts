import fs from "node:fs/promises";
import {NextResponse} from "next/server";
import {estMemeTuile} from "@/app/utils/jsonUtils";
import {CarteJSON, Connexion} from "@/app/modules/Interfaces";

/**
 * route → /api/cartes/ajouter
 * Route en POST prenant les modifications effectuées dans l'éditeur de cartes et modifie le fichier JSON correspondant en conséquence
 */
export async function POST(req: Request): Promise<NextResponse> {
    try {
        // Variables servant à stocker les potentielles valeurs reçues par le JSON
        const jsonReq: Record<string, unknown> = await req.json();

        let nom: string | null = null;
        let residenceInfo: [number, number] | null = null;
        let residenceBio: [number, number] | null = null;
        let montagne: [number, number] | null = null;
        let foret: [number, number] | null = null;
        let ocean: [number, number] | null = null;
        let plaine: [number, number] | null = null;
        let tyrolienne: [number, number][] | null = null;
        let riviere: [number, number][] | null = null;

        // Pour chaque clé, je stocke dans sa variable associé le contenu présent dans le JSON
        for (const key in jsonReq) {
            switch (key) {
                case "nom": {
                    nom = jsonReq[key] as string;
                    break;
                }
                case "info": {
                    residenceInfo = jsonReq[key] as [number, number];
                    break;
                }
                case "bio": {
                    residenceBio = jsonReq[key] as [number, number];
                    break;
                }
                case "montagne": {
                    montagne = jsonReq[key] as [number, number];
                    break;
                }
                case "foret": {
                    foret = jsonReq[key] as [number, number];
                    break;
                }
                case "plaine": {
                    plaine = jsonReq[key] as [number, number];
                    break;
                }
                case "ocean": {
                    ocean = jsonReq[key] as [number, number];
                    break;
                }
                case "tyrolienne": {
                    tyrolienne = jsonReq[key] as [number, number][];
                    break;
                }
                case "riviere": {
                    riviere = jsonReq[key] as [number, number][];
                    break;
                }
                default: {
                    NextResponse.json({status: "error", error: "Champ inconnu"});
                }
            }
        }

        // On ouvre le fichier JSON associé
        const data: string = await fs.readFile(`./public/json/${nom}.json`, "utf8");
        const json: CarteJSON = JSON.parse(data) as CarteJSON;

        console.log("JSON lu:", json);

        // Gestion de la sauvegarde des résidences
        if (residenceInfo) json.résidences.info = residenceInfo;

        if (residenceBio) json.résidences.bio = residenceBio;

        // Fonction qui permet de retirer des terrains s'ils sont déjà présents dans le JSON
        const retirerDesTerrainsSiPresent: (tuile: [number, number]) => void = (tuile: [number, number]) => {
            const {terrains} = json;
            if (!terrains) return;

            const indexMontagne: number = terrains.montagne?.findIndex((t: [number, number]) => estMemeTuile(t, tuile)) ?? -1;
            if (indexMontagne !== -1) terrains.montagne.splice(indexMontagne, 1);

            const indexForet: number = terrains.foret?.findIndex((t: [number, number]) => estMemeTuile(t, tuile)) ?? -1;
            if (indexForet !== -1) terrains.foret.splice(indexForet, 1);

            const indexPlaine: number = terrains.plaine?.findIndex((t: [number, number]) => estMemeTuile(t, tuile)) ?? -1;
            if (indexPlaine !== -1) terrains.plaine.splice(indexPlaine, 1);
        };

        // Gestion des terrains
        if (montagne) {
            retirerDesTerrainsSiPresent(montagne);
            json.terrains.montagne.push(montagne);
        }

        if (foret) {
            retirerDesTerrainsSiPresent(foret);
            json.terrains.foret.push(foret);
        }

        if (plaine) {
            retirerDesTerrainsSiPresent(plaine);
            json.terrains.plaine.push(plaine);
        }

        if (ocean) retirerDesTerrainsSiPresent(ocean);

        // Gestion des connexions
        if (tyrolienne) {
            json.connexions = json.connexions.filter((connexion: Connexion) => {
                if (connexion.type !== "riviere") return true;

                const estEnConflit: boolean = connexion.tuiles.some((tuileRiviere: [number, number]) =>
                    (tyrolienne as [number, number][]).some((tuileTyro: [number, number]) =>
                        JSON.stringify(tuileRiviere) === JSON.stringify(tuileTyro) ||
                        JSON.stringify(tuileRiviere) === JSON.stringify([...tuileTyro].reverse())
                    )
                );

                if (estEnConflit) console.log("Conflit rivière supprimé :", connexion);
                return !estEnConflit;
            });

            json.connexions.push({
                "type": "tyrolienne",
                "tuiles": tyrolienne
            });
        }

        if (riviere) {
            json.connexions = json.connexions.filter((connexion: Connexion) => {
                if (connexion.type !== "tyrolienne") return true;

                const estEnConflit: boolean = connexion.tuiles.some((tuileTyrolienne: [number, number]) =>
                    (riviere as [number, number][]).some((tuileRiviere: [number, number]) =>
                        JSON.stringify(tuileTyrolienne) === JSON.stringify(tuileRiviere) ||
                        JSON.stringify(tuileTyrolienne) === JSON.stringify([...tuileRiviere].reverse())
                    )
                );

                if (estEnConflit) console.log("Conflit tyrolienne supprimé :", connexion);
                return !estEnConflit;
            });

            json.connexions.push({
                "type": "riviere",
                "tuiles": riviere
            });
        }

        console.log("JSON Final avant écriture:", JSON.stringify(json, null, 2));

        await fs.writeFile(`./public/json/${nom}.json`, JSON.stringify(json, null, 2));

        return NextResponse.json({status: "success"});
    } catch (error) {
        console.log("Erreur serveur:", error);
        return NextResponse.json({status: "error", error: String(error)});
    }
}