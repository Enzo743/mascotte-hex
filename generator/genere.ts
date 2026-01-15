import {Command} from 'commander';
import fs from "node:fs/promises";

const program = new Command();

const Terrains = {
    Ocean: 'Océan',
    Plaine: 'Plaine',
    Foret: 'Forêt',
    Montagne: 'Montagne'
} as const;
type TerrainType = typeof Terrains[keyof typeof Terrains];

interface CelluleTyro {
    estDebut: boolean;
    celluleSuivante: Cellule | undefined;
}

interface Cellule {
    x: number;
    y: number;
    type: TerrainType;
    idIle?: number;
    idMassif?: number;
    estResidenceInfo: boolean;
    estResidenceBio: boolean;
    estRiviere?: boolean;
    tyrolienne?: CelluleTyro;
}

interface Options {
    lignes: number;
    colonnes: number;
    plaines: number;
    forets: number;
    montagnes: number;
    iles: number;
    massifs_foret: number;
    massifs_montagne: number;
    longueur_rivieres: number;
    tyroliennes: number;
    output: string;
}

let globalMassifCompteur: number = 1;

/*
 * Permet de distribuer 'total' entiers dans 'partie'
 */
function distribuerEntier(total: number, partie: number, variation: number = 0.5): number[] {
    if (partie === 0) return [];

    let reste: number = total;
    const resultat: number[] = [];
    const moyenne: number = Math.floor(total / partie);

    for (let i: number = 0; i < partie - 1; i++) {
        // On varie autour de la moyenne sans dépasser le reste
        let valeur: number = Math.floor(moyenne * (1 - variation + Math.random() * variation * 2));

        valeur = Math.max(1, Math.min(valeur, reste - (partie - i - 1))); // Garder au moins 1 pour les suivants
        resultat.push(valeur);
        reste -= valeur;
    }

    resultat.push(reste); // La dernière part prend tout le reste
    return resultat;
}

/*
 * Permet de récupérer les voisins d'une case
 */
function getVoisins(grille: Cellule[][], x: number, y: number, lignes: number, colonnes: number): Cellule[] {
    const directions: number[][] = y % 2 === 0
        ? [[1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]]
        : [[1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]];
    const voisins: Cellule[] = [];

    for (const [dx, dy] of directions) {
        const nx: number = x + dx;
        const ny: number = y + dy;

        if (nx >= 0 && nx < colonnes && ny >= 0 && ny < lignes) {
            voisins.push(grille[ny][nx]);
        }
    }

    return voisins;
}

/*
 * Permet de vérifier si une case peut faire partie d'une île
 */
function estEmplacementValidePourIle(grille: Cellule[][], x: number, y: number, idIleActuelle: number, lignes: number, colonnes: number): boolean {
    const voisins: Cellule[] = getVoisins(grille, x, y, lignes, colonnes);

    return voisins.every((v: Cellule): boolean => v.idIle === undefined || v.idIle === idIleActuelle); // Est valide si aucun voisin n'appartient à une autre île
}

/**
 * Permet d'interpoler entre deux hexagones et retourner toutes les cases traversées
 */
function getHexagonesEntreDeuxPoints(grille: Cellule[][], depart: Cellule, arrivee: Cellule, options: Options): Cellule[] {
    // Conversion offset vers axial (q, r)
    const offsetVersAxial = (x: number, y: number): [number, number] => {
        const q: number = x - Math.floor(y / 2);
        return [q, y];
    };

    // Conversion axial vers offset
    const axialVersOffset = (q: number, r: number): [number, number] => {
        const x: number = q + Math.floor(r / 2);
        return [x, r];
    };

    const [q1, r1]: [number, number] = offsetVersAxial(depart.x, depart.y);
    const [q2, r2]: [number, number] = offsetVersAxial(arrivee.x, arrivee.y);

    // Calculer la distance en coordonnées cubiques
    const distance: number = Math.max(
        Math.abs(q2 - q1),
        Math.abs(r2 - r1),
        Math.abs((q2 + r2) - (q1 + r1))
    );

    const casesTraversees: Cellule[] = [];

    // Interpoler pour chaque étape
    for (let i: number = 0; i <= distance; i++) {
        const t: number = distance === 0 ? 0 : i / distance;

        // Interpolation linéaire
        const q: number = Math.round(q1 + (q2 - q1) * t);
        const r: number = Math.round(r1 + (r2 - r1) * t);

        // Conversion vers offset
        const [x, y]: [number, number] = axialVersOffset(q, r);

        // Vérifier les limites et ajouter la cellule
        if (x >= 0 && x < options.colonnes && y >= 0 && y < options.lignes) {
            const cellule: Cellule = grille[y][x];
            if (!casesTraversees.some((c: Cellule): boolean => c.x === cellule.x && c.y === cellule.y)) {
                casesTraversees.push(cellule);
            }
        }
    }

    return casesTraversees;
}

/**
 * Permet d'implémenter l'algorithme de croissance de massif
 */
function genererMassifs(grille: Cellule[][], tuilesDisponibles: Cellule[], nbMassifs: number, nbTuilesTotal: number, typeTerrain: TerrainType, lignes: number, colonnes: number): boolean {
    if (nbTuilesTotal === 0) return true;
    if (tuilesDisponibles.length < nbTuilesTotal) return false;

    //Permet de définir les points de départ des massifs
    let tuilesRestantesAPlacer: number = nbTuilesTotal;
    const fileAttente: Cellule[] = [];

    // Mélange des tuiles disponibles pour l'aléatoire
    tuilesDisponibles.sort((): number => Math.random() - 0.5);

    let massifsCrees: number = 0;
    for (const tuile of tuilesDisponibles) {
        if (massifsCrees >= nbMassifs) break;

        // On vérifie de ne pas coller un massif du même type
        const voisins: Cellule[] = getVoisins(grille, tuile.x, tuile.y, lignes, colonnes);
        const toucheMemeType: boolean = voisins.some((v: Cellule): boolean => v.type === typeTerrain);

        if (!toucheMemeType) {
            tuile.type = typeTerrain;
            tuile.idMassif = globalMassifCompteur++;

            fileAttente.push(tuile);
            tuilesRestantesAPlacer--;
            massifsCrees++;
        }
    }

    if (massifsCrees < nbMassifs) return false;

    // On boucle tant qu'il reste des tuiles à placer
    let tentatives: number = 0;
    while (tuilesRestantesAPlacer > 0 && tentatives < 10000) {
        tentatives++;

        // On prend un des points de départ
        const indexSource: number = Math.floor(Math.random() * fileAttente.length);
        const source: Cellule = fileAttente[indexSource];

        const voisins: Cellule[] = getVoisins(grille, source.x, source.y, lignes, colonnes);
        // On cherche un voisin qui est une plaine disponible et qui appartient à la même île
        const candidats: Cellule[] = voisins.filter((v: Cellule): boolean =>
            v.type === Terrains.Plaine &&
            v.idIle === source.idIle
        );

        if (candidats.length > 0) {
            const cible: Cellule = candidats[Math.floor(Math.random() * candidats.length)];

            // On vérifie que la cible ne doit pas toucher un autre massif du même type
            const voisinsCible: Cellule[] = getVoisins(grille, cible.x, cible.y, lignes, colonnes);
            const conflitMassif: boolean = voisinsCible.some(v => v.type === typeTerrain && v.idMassif !== source.idMassif);

            if (!conflitMassif) {
                cible.type = typeTerrain;
                cible.idMassif = source.idMassif;

                fileAttente.push(cible);
                tuilesRestantesAPlacer--;
            }
        }
    }

    return tuilesRestantesAPlacer === 0;
}

/**
 * Permet de générer une île avec ses massifs
 */
function construireIle(grille: Cellule[][], options: Options, idIle: number, nbPlaines: number, nbForets: number, nbMontagnes: number, nbMassifsF: number, nbMassifsM: number): {
    succes: boolean,
    tuilesIle: Cellule[]
} {
    const totalTuiles: number = nbPlaines + nbForets + nbMontagnes;
    const lignes: number = options.lignes;
    const colonnes: number = options.colonnes;

    // On trouve un point de départ
    let depart: Cellule | null = null;
    let essais: number = 0;
    while (!depart && essais < 500) {
        const x: number = Math.floor(Math.random() * colonnes);
        const y: number = Math.floor(Math.random() * lignes);

        if (grille[y][x].type === Terrains.Ocean && estEmplacementValidePourIle(grille, x, y, idIle, lignes, colonnes)) {
            depart = grille[y][x];
        }

        essais++;
    }

    if (!depart) return {"succes": false, "tuilesIle": []};

    // Créer l'île avec uniquement des plaines
    const tuilesIle: Cellule[] = [];
    const file: Cellule[] = [depart];

    depart.type = Terrains.Plaine;
    depart.idIle = idIle;
    tuilesIle.push(depart);

    while (tuilesIle.length < totalTuiles && file.length > 0) {
        const indice: number = Math.floor(Math.random() * file.length);
        const centre: Cellule = file.splice(indice, 1)[0];
        const voisins: Cellule[] = getVoisins(grille, centre.x, centre.y, lignes, colonnes);

        for (const v of voisins) {
            if (tuilesIle.length >= totalTuiles) break;

            if (v.type === Terrains.Ocean && v.idIle === undefined) {
                if (estEmplacementValidePourIle(grille, v.x, v.y, idIle, lignes, colonnes)) {
                    v.type = Terrains.Plaine;
                    v.idIle = idIle;
                    tuilesIle.push(v);
                    file.push(v);
                }
            }
        }
    }

    if (tuilesIle.length < totalTuiles) return {"succes": false, "tuilesIle": []};

    // On complète l'île avec des forêts et des montagnes
    const plainesDisponibles: Cellule[] = [...tuilesIle];

    // Génération des montagnes
    const succesMontagnes: boolean = genererMassifs(grille, plainesDisponibles, nbMassifsM, nbMontagnes, Terrains.Montagne, lignes, colonnes);
    if (!succesMontagnes) return {"succes": false, "tuilesIle": []};

    // Mise à jour des plaines qui ne sont pas devenues des montagnes
    const plainesRestantes: Cellule[] = tuilesIle.filter(c => c.type === Terrains.Plaine);

    // Génération des forêts
    const succesForets: boolean = genererMassifs(grille, plainesRestantes, nbMassifsF, nbForets, Terrains.Foret, lignes, colonnes);
    if (!succesForets) return {"succes": false, "tuilesIle": []};

    return {
        "succes": true,
        "tuilesIle": tuilesIle
    };
}

/**
 * Permet de générer des tyroliennes
 */
function genererTyrolienne(grille: Cellule[][], tuilesIles: Cellule[][], options: Options, tuileDepart: Cellule,
                           idIleFin: number): boolean {
    const voisinsTuileDepart: Cellule[] = getVoisins(grille, tuileDepart.x, tuileDepart.y,
        options.lignes, options.colonnes);

    if (!tuileDepart.estResidenceInfo && !tuileDepart.estResidenceBio
        && (voisinsTuileDepart.filter((voisin: Cellule): boolean => voisin.estResidenceInfo).length === 0)
        && (voisinsTuileDepart.filter((voisin: Cellule): boolean => voisin.estResidenceBio).length === 0)
        && !tuileDepart.tyrolienne) {

        const tuilesDestination = [...tuilesIles[idIleFin - 1]];
        tuilesDestination.sort(() => Math.random() - 0.5);

        for (const tuileFin of tuilesDestination) {
            const voisinsTuileFin: Cellule[] = getVoisins(grille, tuileFin.x, tuileFin.y,
                options.lignes, options.colonnes);

            if ((tuileFin.type === Terrains.Foret || tuileFin.type === Terrains.Plaine)
                && tuileDepart !== tuileFin
                && !voisinsTuileDepart.includes(tuileFin)
                && !tuileFin.estResidenceBio && !tuileFin.estResidenceInfo
                && !tuileFin.tyrolienne
                && (voisinsTuileFin.filter((voisin: Cellule): boolean => voisin.estResidenceInfo).length === 0)
                && (voisinsTuileFin.filter((voisin: Cellule): boolean => voisin.estResidenceBio).length === 0)) {

                const tuilesEntreLesDeuxPoints: Cellule[] = getHexagonesEntreDeuxPoints(grille, tuileDepart,
                    tuileFin, options);

                if (!tuilesEntreLesDeuxPoints.some((tuile: Cellule): boolean => tuile.type === Terrains.Montagne)) {
                    tuileDepart.tyrolienne = {estDebut: true, celluleSuivante: tuileFin};
                    return true;
                }
            }
        }
    }

    return false;
}

/*
 * Permet de générer une carte en fonction des options passées dans la ligne de commande
 */
function genererCarteComplete(options: Options): Cellule[][] | null {
    const nbTentativesMax: number = 200;

    console.log(`\n--- DÉBUT GÉNÉRATION (${options.lignes}x${options.colonnes}) ---`);

    for (let tentative: number = 1; tentative <= nbTentativesMax; tentative++) {
        // Initialisation d'une grille vide
        const grille: Cellule[][] = [];

        for (let y: number = 0; y < options.lignes; y++) {
            const ligne: Cellule[] = [];

            for (let x: number = 0; x < options.colonnes; x++) {
                ligne.push({x, y, type: Terrains.Ocean, estResidenceInfo: false, estResidenceBio: false});
            }

            grille.push(ligne);
        }

        // Calculer la répartition
        const distPlaines: number[] = distribuerEntier(options.plaines, options.iles);
        const distForets: number[] = distribuerEntier(options.forets, options.iles);
        const distMontagnes: number[] = distribuerEntier(options.montagnes, options.iles);
        const distMassifsF: number[] = distribuerEntier(options.massifs_foret, options.iles, 0.2);
        const distMassifsM: number[] = distribuerEntier(options.massifs_montagne, options.iles, 0.2);

        // Essayer de placer toutes les îles
        let carteValide: boolean = true;
        const tabIdIle: number[] = [];
        const tuilesIles: Cellule[][] = [];

        for (let i: number = 0; i < options.iles; i++) {
            const idIle: number = i + 1;
            tabIdIle.push(idIle);

            const {succes, tuilesIle} = construireIle(
                grille,
                options,
                idIle,
                distPlaines[i],
                distForets[i],
                distMontagnes[i],
                distMassifsF[i],
                distMassifsM[i]
            );

            if (succes) tuilesIles.push(tuilesIle);

            if (!succes) {
                carteValide = false;
                break;
            }
        }

        let idIleResInfo: number = tabIdIle[0];
        let idIleResBio: number = tabIdIle[1];

        if (options.iles > 2) {
            do {
                idIleResInfo = tabIdIle[Math.floor(Math.random() * (tabIdIle.length - 1))];
                idIleResBio = tabIdIle[Math.floor(Math.random() * (tabIdIle.length - 1))];
            } while (idIleResInfo === idIleResBio);
        }

        let indiceAleatoireInfo: number = Math.floor(Math.random() * tuilesIles[idIleResInfo - 1].length);
        let indiceAleatoireBio: number = Math.floor(Math.random() * tuilesIles[idIleResBio - 1].length);
        let tuileInfoAleatoire: Cellule = tuilesIles[idIleResInfo - 1][indiceAleatoireInfo];
        let tuileBioAleatoire: Cellule = tuilesIles[idIleResBio - 1][indiceAleatoireBio];

        while ((tuileInfoAleatoire.type === Terrains.Ocean || tuileInfoAleatoire.type === Terrains.Montagne) || (tuileBioAleatoire.type === Terrains.Ocean || tuileBioAleatoire.type === Terrains.Montagne)) {
            indiceAleatoireInfo = Math.floor(Math.random() * tuilesIles[idIleResInfo - 1].length);
            indiceAleatoireBio = Math.floor(Math.random() * tuilesIles[idIleResBio - 1].length);
            tuileInfoAleatoire = tuilesIles[idIleResInfo - 1][indiceAleatoireInfo];
            tuileBioAleatoire = tuilesIles[idIleResBio - 1][indiceAleatoireBio];
        }

        tuileInfoAleatoire.estResidenceInfo = true;
        tuileBioAleatoire.estResidenceBio = true;

        if (carteValide) {
            console.log(`Succès à la tentative ${tentative}`);
            console.log(grille);
            return grille;
        }
    }

    console.error("Échec : Impossible de générer la carte avec ces contraintes.");
    return null;
}

program
    .option('-l, --lignes <LIGNES>', 'Nombre de lignes', '12')
    .option('-c, --colonnes <COLONNES>', 'Nombre de colonnes', '12')
    .option('-p, --plaines <PLAINES>', 'Nombre de tuiles de plaines', '42')
    .option('-f, --forets <FORETS>', 'Nombre de tuiles de forêts', '18')
    .option('-m, --montagnes <MONTAGNES>', 'Nombre de tuiles de montagnes', '13')
    .option('-i, --iles <ILES>', 'Nombre d\'îles', '2')
    .option('--mm, --massifs-montagne <MASSIFS_MONTAGNE>', 'Nombre de massifs de montagnes', '3')
    .option('--mf, --massifs-foret <MASSIFS_FORET>', 'Nombre de massifs de forêts', '4')
    .option('--lr, --longueur-rivieres <LONGUEUR_RIVIERES>', 'Nombre de tuiles avec au moins une rivière', '30')
    .option('-t, --tyroliennes <TYROLIENNES>', 'Nombre de tyroliennes', '4')
    .option('-o, --output <OUTPUT>', 'Nom du fichier de sortie', 'cartes')
    .helpOption('-h, --help', 'Affiche l\'aide')
    .parse(process.argv);

program.showHelpAfterError('(SOS: faire -h pour obtenir de l\'aide)');

const optionsArgs = program.opts();

const options: Options = {
    lignes: parseInt(optionsArgs.lignes),
    colonnes: parseInt(optionsArgs.colonnes),
    plaines: parseInt(optionsArgs.plaines),
    forets: parseInt(optionsArgs.forets),
    montagnes: parseInt(optionsArgs.montagnes),
    iles: parseInt(optionsArgs.iles),
    massifs_foret: parseInt(optionsArgs.massifsForet),
    massifs_montagne: parseInt(optionsArgs.massifsMontagne),
    longueur_rivieres: parseInt(optionsArgs.longueurRivieres),
    tyroliennes: parseInt(optionsArgs.tyroliennes),
    output: optionsArgs.output
};

if (options.iles === 1) {
    console.error("[Erreur] - Vous ne pouvez pas avoir une seule île, un minimum de deux est nécessaire !");
    process.exit(1);
}

if (options.plaines + options.forets + options.montagnes > options.lignes * options.colonnes) {
    console.error("[Erreur] - Vous ne pouvez pas avoir plus de tuiles que de cases !");
    process.exit(1);
}

if (options.plaines + options.forets + options.montagnes + options.lignes + options.colonnes > options.lignes * options.colonnes) {
    console.error("[Erreur] - Il doit y avoir de l'océan entre les îles !");
    process.exit(1);
}

if (options.tyroliennes > options.lignes * options.colonnes || options.longueur_rivieres > options.lignes * options.colonnes) {
    console.error("[Erreur] - Il ne peut pas y avoir plus de tuiles spéciales que de cases !");
    process.exit(1);
}

if (options.iles > options.massifs_montagne || options.iles > options.massifs_foret) {
    console.error("[Erreur] - Il doit y avoir au moins un massif par île !");
    process.exit(1);
}

if (options.tyroliennes < 2) {
    console.error("[Erreur] - Il doit y avoir au moins 2 tyroliennes pour relier les îles entre elles !");
    process.exit(1);
}

// Lancement de la génération
const grilleFinale: Cellule[][] | null = genererCarteComplete(options);

if (grilleFinale) {
    const sortieData = {
        grille: {lignes: options.lignes, colonnes: options.colonnes},
        résidences: {
            info: [] as number[],
            bio: [] as number[],
        },
        terrains: {
            plaine: [] as number[][],
            foret: [] as number[][],
            montagne: [] as number[][]
        },
        connexions: [] as any[]
    };

    // Remplissage des données
    for (let y: number = 0; y < options.lignes; y++) {
        for (let x: number = 0; x < options.colonnes; x++) {
            const cellule: Cellule = grilleFinale[y][x];
            if (cellule.type === Terrains.Plaine) sortieData.terrains.plaine.push([x, y]);
            if (cellule.type === Terrains.Foret) sortieData.terrains.foret.push([x, y]);
            if (cellule.type === Terrains.Montagne) sortieData.terrains.montagne.push([x, y]);
            if (cellule.estResidenceInfo) {
                sortieData.résidences.info.push(x);
                sortieData.résidences.info.push(y);
            }
            if (cellule.estResidenceBio) {
                sortieData.résidences.bio.push(x);
                sortieData.résidences.bio.push(y);
            }
            if (cellule.tyrolienne?.estDebut && cellule.tyrolienne?.celluleSuivante != undefined) {
                const connexionTyro = {
                    type: "tyrolienne",
                    tuiles: [
                        [cellule.x, cellule.y],
                        [cellule.tyrolienne?.celluleSuivante.x, cellule.tyrolienne?.celluleSuivante.y]
                    ]
                };

                sortieData.connexions.push(connexionTyro);
            }
        }
    }

    // Écriture du fichier JSON
    const chemin = `./${options.output}.json`;
    fs.writeFile(chemin, JSON.stringify(sortieData, null, 2))
        .then((): void => console.log(`Fichier sauvegardé à l'adresse : ${chemin}`))
        .catch(err => console.error("Erreur écriture du fichier :", err));
}