import {Case} from "@/app/components/Structure";
import {getHexagonesEntreDeuxPoints, getVoisins} from "@/app/utils/hexagoneUtils";
import {setTuiles} from "@/app/actions/setTuiles";
import {getCarte} from "@/app/actions/getCarte";
import {supprimerTuile} from "@/app/actions/supprimerTuile";

interface useClicHandlerProps {
    carteId: string | null;
    rayon: number;
    hexagones: Case[];
    posInfo: Case | null;
    posBio: Case | null;
    terrainSelectionne: string | null;
    residenceSelectionnee: string | null;
    connexionsSelectionnee: string | null;
    tyrolienneStart: [number, number] | null;
    riviereStart: [number, number] | null;
    casesRiviere: [number, number];
    setTyrolienneStart: (value: [number, number] | null) => void;
    setRiviereStart: (value: [number, number] | null) => void;
    setCasesRiviere: (value: [number, number][] | null) => void;
    pushMsg: (text: string, level: "ok" | "erreur") => void;
    appliquerCarte: (json: any, rayon: number) => void;
    sauvegardeHistorique: (jsonData: any) => void;
    jsonData: any;
}

export function useClicHandler(props: useClicHandlerProps) {
    // Fonction qui s'occupe de toutes les vérifications nécessaires à la gestion des résidences
    const verifResidences = (hex: Case, date: string, pos: any): string => {
        if (hex.type === "ocean" || hex.type === "montagne") {
            props.pushMsg("[" + date + `] - Vous ne pouvez pas mettre une résidence sur une case de type ${hex.type}`, "erreur");
            return "Erreur";
        }

        // On vérifie d'abord si 'pos' (l'autre résidence) est définie avant de lire son ID
        if (pos && hex.id === pos.id) {
            props.pushMsg("[" + date + `] - Vous ne pouvez pas mettre une résidence sur cette case, il y a déjà une résidence`, "erreur");
            return "Erreur";
        }

        const voisins = getVoisins(hex, props.hexagones);

        for (let i = 0; i < voisins.length; i++) {
            if (pos && voisins[i].id === pos.id) {
                props.pushMsg("[" + date + `] - Vous ne pouvez pas mettre une résidence sur cette case, il y a déjà une résidence dans une case adjacente`, "erreur");
                return "Erreur";
            }
        }

        return "Super";
    }

    // Fonction qui s'occupe de faire les vérifications une fois les résidences posées
    const verifResidence = (type: string, date: string) => {
        if (type === "montagne" || type === "ocean") {
            props.pushMsg("[" + date + `] - Erreur, une résidence ne peut pas être sur une case de type ${type}`, "erreur");
            return false;
        }

        return true;
    }

    // Fonction vérifiant si la modification du terrain brise une condition des rivières existantes
    const verifRiviere = (type: string, hex: Case, date: string) => {
        const connexions = props.jsonData?.connexions || [];
        const rivieres = connexions.filter((c: any) => c.type === "riviere");

        for (const riviere of rivieres) {
            const x = Number(hex.id.split("-")[0]);
            const y = Number(hex.id.split("-")[1]);
            const index = riviere.tuiles.findIndex((t: any) => t[0] === x && t[1] === y);

            if (index !== -1) {
                if (type === "montagne") {
                    props.pushMsg("[" + date + `] - Erreur, une rivière ne peut pas contenir de montagne`, "erreur");
                    return false;
                }

                const estLaFin = index === riviere.tuiles.length - 1;
                if (type === "ocean" && !estLaFin) {
                    props.pushMsg("[" + date + `] - Erreur, seul le point final d'une rivière peut être un océan`, "erreur");
                    return false;
                }
            }
        }
        return true;
    }

    // Fonction vérifiant si la modification du terrain brise une tyrolienne existante
    const verifTyrolienne = (type: string, hex: Case, date: string) => {
        const connexions = props.jsonData?.connexions || [];
        const tyroliennes = connexions.filter((c: any) => c.type === "tyrolienne");

        for (const tyro of tyroliennes) {
            const [start, end] = tyro.tuiles;
            const x = Number(hex.id.split("-")[0]);
            const y = Number(hex.id.split("-")[1]);

            if (start[0] === x && start[1] === y) {
                console.log("Coucou !");
                if (type !== "foret") {
                    props.pushMsg("[" + date + "] - Erreur, le départ d'une tyrolienne doit rester une forêt", "erreur");
                    return false;
                }
            }

            if (end[0] === x && end[1] === y) {
                if (type === "ocean" || type === "montagne") {
                    props.pushMsg("[" + date + `] - Erreur, l'arrivée d'une tyrolienne ne peut pas devenir ${type}`, "erreur");
                    return false;
                }
            }
        }
        return true;
    }

    const verifMilieuTyrolienne = (type: string, hex: Case, date: string) => {
        const connexions = props.jsonData?.connexions || [];
        const tyroliennes = connexions.filter((c: any) => c.type === "tyrolienne");

        for (const tyro of tyroliennes) {
            const [start, end] = tyro.tuiles;
            const casesMilieu = getHexagonesEntreDeuxPoints(start, end, props.hexagones);

            if (casesMilieu.some((c) => c.id === hex.id) && type === "montagne") {
                props.pushMsg("[" + date + "] - Erreur, une tyrolienne ne peut pas avoir une montagne sur son chemin", "erreur");
                return false;
            }
        }
        return true;
    }

    // Fonction qui gère les actions lors du clic sur un terrain d'un onglet
    const handleTerrainClic = async (type: string, hex: Case, x: number, y: number, date: string) => {
        if ((props.posBio?.position.x === x && props.posBio?.position.y === y) || (props.posInfo?.position.x === x && props.posInfo?.position.y === y)) {
            if (!verifResidence(type, date)) return;
        }

        // Vérifications basées sur le JSON actuel
        if (!verifRiviere(type, hex, date)) return;
        if (!verifTyrolienne(type, hex, date)) return;
        if (!verifMilieuTyrolienne(type, hex, date)) return;

        const reponse = await setTuiles(JSON.stringify({
            "nom": `${props.carteId}`,
            [type]: [x, y]
        }));

        if (reponse.status === "success") {
            const json: Promise<any> = await getCarte(props.carteId);

            if (json && !json.error) {
                props.appliquerCarte(json, props.rayon);
                props.pushMsg("[" + date + `] - Ajout d'un terrain ${type} en position (` + x + ", " + y + ")", "ok");
                props.sauvegardeHistorique(json);
            } else {
                props.pushMsg("[" + date + `] - Erreur lors de l'ajout d'un terrain ${type} en position ` + x + ", " + y + ")", "erreur");
            }
        }

    }

    // Fonction qui gère les actions lors du clic sur une résidence d'un onglet
    const handleResidenceClic = async (type: string, hex: Case, x: number, y: number, date: string) => {
        const posAutre: any = type === "info" ? props.posBio : props.posInfo;

        if (verifResidences(hex, date, posAutre) === "Erreur") {
            return;
        }

        const label: string = type === "info" ? "d'informaticien" : "de biologiste";
        const reponse: any = await setTuiles(JSON.stringify({
            "nom": `${props.carteId}`,
            [type]: [x, y]
        }));

        if (reponse.status === "success") {
            const json: Promise<any> = await getCarte(props.carteId);

            if (json && !json.error) {
                console.log(json);
                props.appliquerCarte(json, props.rayon);
                props.pushMsg("[" + date + `] - Ajout d'une résidence ${label} en position (` + x + ", " + y + ")", "ok");
                props.sauvegardeHistorique(json);
            }
        }
    }

    // Fonction qui gère les actions lors du clic sur une tyrolienne d'un onglet
    const handleTyrolienneClic = async (hex: Case, x: number, y: number, date: string, modeTyrolienne: boolean) => {
        if (modeTyrolienne) {
            if (props.tyrolienneStart === null) {
                if (hex.type !== "foret") {
                    props.pushMsg("[" + date + "] - Erreur, vous ne pouvez débuter une tyrolienne que depuis une forêt", "erreur");
                    props.setTyrolienneStart(null);
                    return;
                }

                props.setTyrolienneStart([x, y]);
                props.pushMsg("[" + date + "] - Point A sélectionné pour la tyrolienne : (" + x + ", " + y + "). Cliquez maintenant sur le point B.", "ok");
                return;
            }

            const [ax, ay]: [number, number] = props.tyrolienneStart;

            if (ax === x && ay === y) {
                props.pushMsg("[" + date + "] - Erreur, le point B doit être différent du point A", "erreur");
                props.setTyrolienneStart(null);
                return;
            }

            if (hex.type === "ocean" || hex.type === "montagne") {
                props.pushMsg("[" + date + "] - Erreur, vous ne pouvez pas mettre une tyrolienne sur une case de type " + hex.type, "erreur");
                props.setTyrolienneStart(null);
                return;
            }

            const casesTraversees: Case[] = getHexagonesEntreDeuxPoints([ax, ay], [x, y], props.hexagones);
            const estCasesMontagne: boolean = casesTraversees.some((c: Case) => c.type === "montagne");

            if (estCasesMontagne) {
                props.pushMsg("[" + date + "] - Erreur, vous ne pouvez pas passer en tyrolienne sur une case de type montagne", "erreur");
                props.setTyrolienneStart(null);
                return;
            }

            const reponse: any = await setTuiles(JSON.stringify({
                "nom": `${props.carteId}`,
                "tyrolienne": [[ax, ay], [x, y]]
            }));

            if (reponse.status === "success") {
                const json: any = await getCarte(props.carteId);

                if (json && !json.error) {
                    props.appliquerCarte(json, props.rayon);
                    props.pushMsg("[" + date + "] - Ajout d'une tyrolienne, whouuuuuu", "ok");
                    props.sauvegardeHistorique(json);
                }
            }

            props.setTyrolienneStart(null);
        } else {
            const response = await supprimerTuile(props.carteId, x, y, "tyrolienne");

            if (response.status === "success") {
                const json: any = await getCarte(props.carteId);

                if (json && !json.error) {
                    props.appliquerCarte(json, props.rayon);
                    props.pushMsg("[" + date + "] - Suppression d'une tyrolienne, bouuuuuuh", "ok");
                    props.sauvegardeHistorique(json);
                }
            }
        }
    }

    // Fonction qui gère les actions lors du clic sur une rivière d'un onglet
    const handleRiviereClic = async (hex: Case, x: number, y: number, date: string, modeRiviere: boolean) => {
        if (modeRiviere) {
            if (props.riviereStart === null) {
                if (hex.type === "montagne") {
                    props.pushMsg("[" + date + "] - Erreur, vous ne pouvez pas placer une rivière sur une case de type montagne", "erreur");
                    return;
                }

                if (hex.type === "ocean") {
                    props.pushMsg("[" + date + "] - Erreur, vous ne pouvez pas débuter une rivière sur une case de type océan", "erreur");
                    return;
                }

                const nouvellesCasesRiviere: [number, number][] = [...(props.casesRiviere || []), [x, y]];

                props.setRiviereStart([x, y]);
                props.setCasesRiviere(nouvellesCasesRiviere);
                props.pushMsg("[" + date + "] - Point A sélectionné pour la rivière : (" + x + ", " + y + "). Cliquez maintenant sur une autre case.", "ok");
                return;
            }

            if (hex.type === "montagne") {
                props.pushMsg("[" + date + "] - Erreur, vous ne pouvez pas placer une rivière sur une case de type montagne", "erreur");
                return;
            }

            if (!props.casesRiviere.some(([ax, ay]) => ax === x && ay === y)) {
                const nouvellesCases = [...props.casesRiviere, [x, y]];

                props.setCasesRiviere(nouvellesCases);

                const response = await fetch(`/api/cartes/riviere`, {
                    method: "POST",
                    body: JSON.stringify({
                        "nom": props.carteId,
                        "tuile": {x, y}
                    })
                });

                const {status, presence} = await response.json();

                if (hex.type === "ocean" && status === "success" && !presence) {
                    const reponse: any = await setTuiles(JSON.stringify(
                        {
                            "nom": `${props.carteId}`,
                            "riviere": nouvellesCases
                        }));

                    if (reponse.status === "success") {
                        const json: any = await getCarte(props.carteId);

                        if (json && !json.error) {
                            props.appliquerCarte(json, props.rayon);
                            props.pushMsg("[" + date + "] - Ajout d'une rivière, splash", "ok");
                            props.setCasesRiviere([]);
                            return;
                        }
                    }
                }

                props.pushMsg("[" + date + "] - Case sélectionnée pour la rivière : (" + x + ", " + y + "). Cliquez maintenant sur une autre case.", "ok");
            } else {
                props.pushMsg("[" + date + "] - Erreur, cette case est déjà incluse dans la rivière", "erreur");
                return;
            }
        } else {
            const response = await supprimerTuile(props.carteId, x, y, "riviere");

            if (response.status === "success") {
                const json: any = await getCarte(props.carteId);

                if (json && !json.error) {
                    props.appliquerCarte(json, props.rayon);
                    props.pushMsg("[" + date + "] - Suppression d'une rivière, glou glou", "ok");
                }
            }
        }
    }

    return {
        handleTerrainClic,
        handleResidenceClic,
        handleTyrolienneClic,
        handleRiviereClic
    };
}