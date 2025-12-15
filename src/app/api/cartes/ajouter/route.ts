import fs from "node:fs/promises";
import {NextResponse} from "next/server";
import {estMemeTuile} from "@/app/utils/jsonUtils";

/**
 * route → /api/cartes/ajouter
 * Route en POST prenant les modifications effectuées dans l'éditeur de cartes et modifie le fichier JSON correspondant en conséquence
 */
export async function POST(req: Request) {
    try {
        // Variables servant à stocker les potentielles valeurs reçues par le JSON
        const jsonReq = await req.json();
        let nom = null;
        let residenceInfo = null;
        let residenceBio = null;
        let montagne = null;
        let foret = null;
        let ocean = null;
        let plaine = null;
        let tyrolienne = null;
        let riviere = null;

        // Pour chaque clé, je stocke dans sa variable associé le contenu présent dans le JSON
        for (const key in jsonReq) {
            switch (key) {
                case "nom": {
                    nom = jsonReq[key];
                    break;
                }
                case "info": {
                    residenceInfo = jsonReq[key];
                    break;
                }
                case "bio": {
                    residenceBio = jsonReq[key];
                    break;
                }
                case "montagne": {
                    montagne = jsonReq[key];
                    break;
                }
                case "foret": {
                    foret = jsonReq[key];
                    break;
                }
                case "plaine": {
                    plaine = jsonReq[key];
                    break;
                }
                case "ocean": {
                    ocean = jsonReq[key];
                    break;
                }
                case "tyrolienne": {
                    tyrolienne = jsonReq[key];
                    break;
                }
                case "riviere": {
                    riviere = jsonReq[key];
                    break;
                }
                default: {
                    NextResponse.json({status: "error", error: "Champ inconnu"});
                }
            }
        }

        // On ouvre le fichier JSON associé
        const data = await fs.readFile(`./public/json/${nom}.json`, "utf8");
        const json = JSON.parse(data);

        console.log("JSON lu:", json);

        // Gestion de la sauvegarde des résidences
        if (residenceInfo) {
            json.résidences.info = residenceInfo;
        }

        if (residenceBio) {
            json.résidences.bio = residenceBio;
        }

        // Fonction qui permet de retirer des terrains s'ils sont déjà présents dans le JSON
        const retirerDesTerrainsSiPresent = (tuile: unknown) => {
            const {terrains} = json;
            if (!terrains) return;

            const indexMontagne = terrains.montagne?.findIndex((t: unknown) => estMemeTuile(t, tuile)) ?? -1;
            if (indexMontagne !== -1) terrains.montagne.splice(indexMontagne, 1);

            const indexForet = terrains.foret?.findIndex((t: unknown) => estMemeTuile(t, tuile)) ?? -1;
            if (indexForet !== -1) terrains.foret.splice(indexForet, 1);

            const indexPlaine = terrains.plaine?.findIndex((t: unknown) => estMemeTuile(t, tuile)) ?? -1;
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

        if (ocean) {
            retirerDesTerrainsSiPresent(ocean);
        }

        // Gestion des connexions
        if (tyrolienne) {
            json.connexions = json.connexions.filter((connexion: { type: string, tuiles: never[] }) => {
                if (connexion.type !== "riviere") return true;

                const estEnConflit = connexion.tuiles.some((tuileRiviere: never[]) =>
                    tyrolienne.some((tuileTyro: never[]) =>
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
            json.connexions = json.connexions.filter((connexion: { type: string, tuiles: never[] }) => {
                if (connexion.type !== "tyrolienne") return true;

                const estEnConflit = connexion.tuiles.some((tuileTyrolienne: never[]) =>
                    riviere.some((tuileRiviere: never[]) =>
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