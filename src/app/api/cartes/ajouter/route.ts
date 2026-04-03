import fs from "node:fs/promises";
import {NextResponse} from "next/server";
import {CarteJSON, Connexion} from "@/app/modules/Interfaces";
import {estEnConflit, retirerDesTerrainsSiPresent} from "@/app/utils/jsonUtils";
import {APITuileCollection} from "@/app/types/api";

/**
 * route → /api/cartes/ajouter
 * Route en POST prenant les modifications effectuées dans l'éditeur de cartes et modifie le fichier JSON correspondant en conséquence
 */
export async function POST(req: Request): Promise<NextResponse> {
    try {
        // Variables servant à stocker les potentielles valeurs reçues par le JSON
        const jsonReq: APITuileCollection = await req.json();

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

        // console.log("JSON lu:", json);

        // Gestion de la sauvegarde des résidences
        if (residenceInfo) json.résidences.info = residenceInfo;
        if (residenceBio) json.résidences.bio = residenceBio;

        // Gestion des terrains
        if (montagne) {
            retirerDesTerrainsSiPresent(json, montagne);
            json.terrains.montagne.push(montagne);
        }

        if (foret) {
            retirerDesTerrainsSiPresent(json, foret);
            json.terrains.foret.push(foret);
        }

        if (plaine) {
            retirerDesTerrainsSiPresent(json, plaine);
            json.terrains.plaine.push(plaine);
        }

        if (ocean) retirerDesTerrainsSiPresent(json, ocean);

        // Gestion des connexions
        if (tyrolienne) {
            json.connexions = json.connexions.filter((connexion: Connexion): boolean => {
                if (connexion.type !== "riviere") return true;

                const isConflit: boolean = estEnConflit(connexion, tyrolienne as [number, number][]);

                if (isConflit) console.log("Conflit rivière supprimé :", connexion);
                return !isConflit;
            });

            json.connexions.push({
                "type": "tyrolienne",
                "tuiles": tyrolienne
            });
        }

        if (riviere) {
            json.connexions = json.connexions.filter((connexion: Connexion): boolean => {
                if (connexion.type !== "tyrolienne") return true;

                const isConflit: boolean = estEnConflit(connexion, riviere as [number, number][]);

                if (isConflit) console.log("Conflit tyrolienne supprimé :", connexion);
                return !isConflit;
            });

            json.connexions.push({
                "type": "riviere",
                "tuiles": riviere
            });
        }

        // console.log("JSON Final avant écriture:", JSON.stringify(json, null, 2));

        await fs.writeFile(`./public/json/${nom}.json`, JSON.stringify(json, null, 2));

        return NextResponse.json({status: "success"});
    } catch (error) {
        console.log("Erreur serveur:", error);
        return NextResponse.json({status: "error", error: String(error)});
    }
}