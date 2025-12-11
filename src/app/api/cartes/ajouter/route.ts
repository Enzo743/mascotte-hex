import fs from "node:fs/promises";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    try {
        const jsonReq = await req.json();
        let nom = null;
        let residenceInfo = null;
        let residenceBio = null;
        let montagne = null;
        let foret = null;
        let plaine = null;
        let tyrolienne = null;
        let riviere = null;

        for (const key in jsonReq) {
            switch (key) {
                case "nom": {
                    nom = jsonReq[key];
                    break;
                }
                case "residenceInfo": {
                    residenceInfo = jsonReq[key];
                    break;
                }
                case "residenceBio": {
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

        const data = await fs.readFile(`./public/json/${nom}.json`, "utf8");
        const json = JSON.parse(data);

        console.log("JSON lu:", json);

        if (residenceInfo) {
            json.résidences.residenceInfo = residenceInfo;
        }

        if (residenceBio) {
            json.résidences.residenceBio = residenceBio;
        }

        const estMemeTuile = (t1: never[], t2: never[]) => JSON.stringify(t1) === JSON.stringify(t2);

        if (montagne) {
            const indexForet = json.terrains.foret.findIndex((t: never) => estMemeTuile(t, montagne));
            if (indexForet !== -1) json.terrains.foret.splice(indexForet, 1);

            const indexPlaine = json.terrains.plaine.findIndex((t: never) => estMemeTuile(t, montagne));
            if (indexPlaine !== -1) json.terrains.plaine.splice(indexPlaine, 1);

            json.terrains.montagne.push(montagne);
        }

        if (foret) {
            const indexMontagne = json.terrains.montagne.findIndex((t: never) => estMemeTuile(t, foret));
            if (indexMontagne !== -1) json.terrains.montagne.splice(indexMontagne, 1);

            const indexPlaine = json.terrains.plaine.findIndex((t: never) => estMemeTuile(t, foret));
            if (indexPlaine !== -1) json.terrains.plaine.splice(indexPlaine, 1);

            json.terrains.foret.push(foret);
        }

        if (plaine) {
            const indexMontagne = json.terrains.montagne.findIndex((t: never) => estMemeTuile(t, plaine));
            if (indexMontagne !== -1) json.terrains.montagne.splice(indexMontagne, 1);

            const indexForet = json.terrains.foret.findIndex((t: never) => estMemeTuile(t, plaine));
            if (indexForet !== -1) json.terrains.foret.splice(indexForet, 1);

            json.terrains.plaine.push(plaine);
        }

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