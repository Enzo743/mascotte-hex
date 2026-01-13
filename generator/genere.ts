import {Command} from 'commander';

const program = new Command();

const Terrains = {
    Ocean: 'Océan',
    Plaine: 'Plaine',
    Foret: 'Forêt',
    Montagne: 'Montagne'
} as const;
type TerrainType = typeof Terrains[keyof typeof Terrains]

interface Cellule {
    x: number;
    y: number;
    type?: TerrainType;
    idIle?: number;
    estRiviere?: boolean;
    tyrolienne?: Cellule[]
}

/**
 * Permet de générer une île
 */
function generationIleAvecId(options, grille: Cellule[][], nbPlaines: number, nbForets: number, nbMontagnes: number, nbMassifsForet: number, nbMassifsMontagne: number, numIdIle: number): boolean {
    const tailleIle = nbPlaines + nbForets + nbMontagnes;

    /**
     * Recherche du point de départ de l'île
     * **/
    let pointDepart: Cellule | null = null;
    let tentatives = 0;

    while (pointDepart === null && tentatives < 1000) {
        const iAleatoire: number = Math.floor(Math.random() * options.lignes);
        const jAleatoire: number = Math.floor(Math.random() * options.colonnes);

        if (grille[iAleatoire][jAleatoire].type === Terrains.Ocean &&
            grille[iAleatoire][jAleatoire].idIle === undefined) {
            pointDepart = grille[iAleatoire][jAleatoire];
        }
        tentatives++;
    }

    if (pointDepart === null) {
        console.error("[Erreur] - Impossible de trouver un point de départ pour l'île");
        return false;
    }

    /**
     * Génération du terrain de l'île avec des plaines
     */
    let nbrHexagones: number = 0;
    const file: Cellule[] = [];

    file.push(pointDepart);

    while (nbrHexagones < tailleIle && file.length > 0) {
        const caseActuelle: Cellule = file.shift()!;

        // Si la case est déjà traitée, on passe
        if (caseActuelle.type !== Terrains.Ocean) {
            continue;
        }

        const voisins = getVoisins(grille, caseActuelle);

        // Vérifier qu'aucun voisin ne fait partie d'une autre île
        let peutAjouter = true;
        for (const voisin of voisins) {
            if (voisin.idIle !== undefined && voisin.idIle !== numIdIle) {
                peutAjouter = false;
                break;
            }
        }

        if (!peutAjouter) {
            continue;
        }

        // Ajout de la case dans l'île comme PLAINE
        caseActuelle.idIle = numIdIle;
        caseActuelle.type = Terrains.Plaine;
        nbrHexagones++;

        // On ne prend que les voisins qui sont des océans et n'appartenant pas à une île
        const voisinsOcean = voisins.filter(v =>
            v.type === Terrains.Ocean &&
            v.idIle === undefined
        );

        // Mélanger et ajouter 1 à 3 voisins
        const nbVoisinsAAjouter = Math.min(
            Math.floor(Math.random() * 3) + 1,
            voisinsOcean.length
        );

        // On mélange les voisins
        for (let i = voisinsOcean.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [voisinsOcean[i], voisinsOcean[j]] = [voisinsOcean[j], voisinsOcean[i]];
        }

        for (let i = 0; i < nbVoisinsAAjouter; i++) {
            if (!file.includes(voisinsOcean[i])) {
                file.push(voisinsOcean[i]);
            }
        }
    }

    if (nbrHexagones < tailleIle) {
        console.warn('Attention, il est impossible d\'atteindre la taille cible pour cette île');
        return false;
    }

    /**
     * Transformation de certaines plaines en forêts
     */
    let totalForetsCreees = 0;
    if (nbMassifsForet > 0 && nbForets > 0) {
        const tuilesParMassif = Math.floor(nbForets / nbMassifsForet);
        const reste = nbForets % nbMassifsForet;

        for (let i = 0; i < nbMassifsForet; i++) {
            let pointDepartForet: Cellule | null = null;
            let tentatives = 0;

            // Trouver un point de départ valide
            while (pointDepartForet === null && tentatives < 200) {
                const iAleatoire = Math.floor(Math.random() * options.lignes);
                const jAleatoire = Math.floor(Math.random() * options.colonnes);

                if (grille[iAleatoire][jAleatoire].idIle === numIdIle &&
                    grille[iAleatoire][jAleatoire].type === Terrains.Plaine) {
                    pointDepartForet = grille[iAleatoire][jAleatoire];
                }
                tentatives++;
            }

            if (pointDepartForet) {
                const tailleForet = tuilesParMassif + (i === 0 ? reste : 0);
                const creees = floodFillHexagonale(grille, pointDepartForet, Terrains.Foret, tailleForet, numIdIle);
                totalForetsCreees += creees;
            }
        }

        // Compléter le nombre de forêts manquantes si nécessaire
        if (totalForetsCreees < nbForets) {
            console.log(`Attention, des forêts sont manquantes: ${nbForets - totalForetsCreees}. Complétion en cours...`);
            completerTerrain(grille, numIdIle, Terrains.Plaine, Terrains.Foret, nbForets - totalForetsCreees);
        }
    }

    /**
     * Transformation de certaines plaines en montagnes
     */
    let totalMontagnesCreees = 0;
    if (nbMassifsMontagne > 0 && nbMontagnes > 0) {
        const tuilesParMassif = Math.floor(nbMontagnes / nbMassifsMontagne);
        const reste = nbMontagnes % nbMassifsMontagne;

        for (let i = 0; i < nbMassifsMontagne; i++) {
            let pointDepartMontagne: Cellule | null = null;
            let tentatives = 0;

            // Trouver un point de départ valide (seulement plaine)
            while (pointDepartMontagne === null && tentatives < 200) {
                const iAleatoire = Math.floor(Math.random() * options.lignes);
                const jAleatoire = Math.floor(Math.random() * options.colonnes);

                if (grille[iAleatoire][jAleatoire].idIle === numIdIle &&
                    grille[iAleatoire][jAleatoire].type === Terrains.Plaine) {
                    pointDepartMontagne = grille[iAleatoire][jAleatoire];
                }
                tentatives++;
            }

            if (pointDepartMontagne) {
                const tailleMontagne = tuilesParMassif + (i === 0 ? reste : 0);
                const creees = floodFillHexagonale(grille, pointDepartMontagne, Terrains.Montagne, tailleMontagne, numIdIle);
                totalMontagnesCreees += creees;
            }
        }

        // Compléter le nombre de montagnes manquantes si nécessaire
        if (totalMontagnesCreees < nbMontagnes) {
            console.log(`Attention, des montagnes sont manquantes: ${nbMontagnes - totalMontagnesCreees}. Complétion en cours...`);
            completerTerrain(grille, numIdIle, Terrains.Plaine, Terrains.Montagne, nbMontagnes - totalMontagnesCreees);
        }
    }

    /**
     * On vérifie que les objectifs sont atteints
     */
    const plainesFinales = compterTerrainPourIle(grille, numIdIle, Terrains.Plaine);
    const foretsFinales = compterTerrainPourIle(grille, numIdIle, Terrains.Foret);
    const montagnesFinales = compterTerrainPourIle(grille, numIdIle, Terrains.Montagne);

    const success = (plainesFinales === nbPlaines) &&
        (foretsFinales === nbForets) &&
        (montagnesFinales === nbMontagnes);

    if (!success) {
        console.warn(`Attention, les objectifs ne sont pas atteints: P=${plainesFinales}/${nbPlaines}, F=${foretsFinales}/${nbForets}, M=${montagnesFinales}/${nbMontagnes}`);
    }

    return success;
}

/**
 * Permet de récupérer les voisins d'une case
 */
function getVoisins(grille: Cellule[][], caseActuelle: Cellule): Cellule[] {
    const voisins: Cellule[] = [];
    const directions: number[][] = [
        [1, 0],   // Droite
        [0, -1],  // Haut-droite
        [-1, -1], // Haut-gauche
        [-1, 0],  // Gauche
        [-1, 1],  // Bas-gauche
        [0, 1]    // Bas-droite
    ];

    for (const [dx, dy] of directions) {
        const x: number = caseActuelle.x + dx;
        const y: number = caseActuelle.y + dy;

        if (y >= 0 && y < grille.length && x >= 0 && x < grille[0].length) {
            const voisin: Cellule = grille[y][x];
            if (voisin) {
                voisins.push(voisin);
            }
        }
    }

    return voisins;
}

/**
 * Fonction de flood afin de créer les massifs
 */
function floodFillHexagonale(grille: Cellule[][], caseDepart: Cellule, type: TerrainType, tailleMax: number, idIle: number): number {
    const file: Cellule[] = [caseDepart];
    const visited: Set<string> = new Set();
    let taille: number = 0;

    while (file.length > 0 && taille < tailleMax) {
        const caseSelec: Cellule = file.shift()!;
        const key = `${caseSelec.x},${caseSelec.y}`;

        if (visited.has(key)) {
            continue;
        }
        visited.add(key);

        const peutTransformer = caseSelec.idIle === idIle && caseSelec.type === Terrains.Plaine;

        if (peutTransformer) {
            caseSelec.type = type;
            taille++;

            const voisins = getVoisins(grille, caseSelec);

            // Mélanger les voisins pour plus de naturel
            for (let i = voisins.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [voisins[i], voisins[j]] = [voisins[j], voisins[i]];
            }

            for (const voisin of voisins) {
                const voisinKey = `${voisin.x},${voisin.y}`;

                if (!visited.has(voisinKey)) {
                    const voisinValide = voisin.idIle === idIle && voisin.type === Terrains.Plaine;

                    if (voisinValide && !file.includes(voisin)) {
                        if (Math.random() > 0.1) {  // 90% de chance de prendre le voisin
                            file.push(voisin);
                        }
                    }
                }
            }
        }
    }

    return taille;
}

/**
 * Fonction qui harmonise le nombre de tuiles par île pour atteindre les objectifs
 */
function bonNombreDeTuiles(type: number, somme: number, tab: number[]): void {
    if (somme > type) {
        let max = Math.max(...tab);
        const index = tab.indexOf(max);

        max -= somme - type;
        tab[index] = max;
    } else if (somme < type) {
        let min = Math.min(...tab);
        const index = tab.indexOf(min);

        min += type - somme;
        tab[index] = min;
    }
}

/**
 * Fonction qui complète les massifs quand il manque des tuiles
 * Elle trouve les plaines adjacentes aux massifs existants pour les étendre naturellement
 */
function completerTerrain(grille: Cellule[][], idIle: number, typeSource: TerrainType, typeCible: TerrainType, nombre: number): number {
    let ajoutees = 0;

    while (ajoutees < nombre) {
        // Trouver toutes les plaines adjacentes aux massifs existants du type cible
        const plainesAdjacentes: Cellule[] = [];

        for (let i = 0; i < grille.length; i++) {
            for (let j = 0; j < grille[i].length; j++) {
                const cellule = grille[i][j];

                // On cherche des plaines de l'île
                if (cellule.idIle === idIle && cellule.type === typeSource) {
                    const voisins = getVoisins(grille, cellule);

                    // Vérifier si au moins un voisin est du type cible
                    const aVoisinTypeCible = voisins.some(v =>
                        v.idIle === idIle && v.type === typeCible
                    );

                    if (aVoisinTypeCible && !plainesAdjacentes.includes(cellule)) {
                        plainesAdjacentes.push(cellule);
                    }
                }
            }
        }

        // Si on ne trouve aucune plaine adjacente, on ne peut pas continuer
        if (plainesAdjacentes.length === 0) {
            console.warn(`⚠️  Plus de plaines adjacentes disponibles pour étendre les massifs. ${ajoutees}/${nombre} ajoutées.`);
            break;
        }

        // Mélanger pour une distribution naturelle
        for (let i = plainesAdjacentes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [plainesAdjacentes[i], plainesAdjacentes[j]] = [plainesAdjacentes[j], plainesAdjacentes[i]];
        }

        // Transformer les plaines adjacentes une par une
        const aTransformer = Math.min(nombre - ajoutees, plainesAdjacentes.length);
        for (let i = 0; i < aTransformer; i++) {
            plainesAdjacentes[i].type = typeCible;
            ajoutees++;
        }
    }

    return ajoutees;
}

/**
 * Fonction qui compte le nombre de tuiles d'un type donné
 */
function compterTerrainPourIle(grille: Cellule[][], idIle: number, type: TerrainType): number {
    let compte = 0;
    for (let i = 0; i < grille.length; i++) {
        for (let j = 0; j < grille[i].length; j++) {
            if (grille[i][j].idIle === idIle && grille[i][j].type === type) {
                compte++;
            }
        }
    }
    return compte;
}

/**
 * Fonction qui reinitialise une île pour une nouvelle tentative
 */
function nettoyerIle(grille: Cellule[][], idIle: number): void {
    for (let i = 0; i < grille.length; i++) {
        for (let j = 0; j < grille[i].length; j++) {
            if (grille[i][j].idIle === idIle) {
                grille[i][j].type = Terrains.Ocean;
                grille[i][j].idIle = undefined;
            }
        }
    }
}

/**
 * Fonction qui réparti les terrains entre les différents îles
 */
function repartirTerrainsParIle(options): {
    plaines: number[],
    forets: number[],
    montagnes: number[],
    massifsMontagne: number[],
    massifsForet: number[]
} {
    const tabPlaines: number[] = [];
    const tabForets: number[] = [];
    const tabMontagnes: number[] = [];
    const tabMassifsMontagne: number[] = [];
    const tabMassifsForet: number[] = [];

    for (let i = 0; i < options.iles; i++) {
        const nbPlaines: number = Math.floor(Math.random() * (options.plaines / options.iles)) + Math.floor(options.plaines / options.iles / 1.9);
        const nbForets: number = Math.floor(Math.random() * (options.forets / options.iles)) + Math.floor(options.forets / options.iles / 1.9);
        const nbMontagnes: number = Math.floor(Math.random() * (options.montagnes / options.iles)) + Math.floor(options.montagnes / options.iles / 1.9);
        const massifsMontagne: number = Math.floor(Math.random() * (options.massifsMontagne / options.iles)) + Math.floor(options.massifsMontagne / options.iles / 1.9);
        const massifsForet: number = Math.floor(Math.random() * (options.massifsForet / options.iles)) + Math.floor(options.massifsForet / options.iles / 1.9);

        tabPlaines.push(nbPlaines);
        tabForets.push(nbForets);
        tabMontagnes.push(nbMontagnes);
        tabMassifsMontagne.push(massifsMontagne);
        tabMassifsForet.push(massifsForet);
    }

    const sumTabPlaines: number = tabPlaines.reduce((a: number, b: number): number => a + b, 0);
    bonNombreDeTuiles(options.plaines, sumTabPlaines, tabPlaines);

    const sumTabForets: number = tabForets.reduce((a: number, b: number): number => a + b, 0);
    bonNombreDeTuiles(options.forets, sumTabForets, tabForets);

    const sumTabMontagnes: number = tabMontagnes.reduce((a: number, b: number): number => a + b, 0);
    bonNombreDeTuiles(options.montagnes, sumTabMontagnes, tabMontagnes);

    const sumTabMassifsMontagne: number = tabMassifsMontagne.reduce((a: number, b: number): number => a + b, 0);
    bonNombreDeTuiles(options.massifsMontagne, sumTabMassifsMontagne, tabMassifsMontagne);

    const sumTabMassifsForet: number = tabMassifsForet.reduce((a: number, b: number): number => a + b, 0);
    bonNombreDeTuiles(options.massifsForet, sumTabMassifsForet, tabMassifsForet);

    return {
        plaines: tabPlaines,
        forets: tabForets,
        montagnes: tabMontagnes,
        massifsMontagne: tabMassifsMontagne,
        massifsForet: tabMassifsForet
    };
}

/**
 * Fonction qui réinitialise la grille pour une nouvelle carte
 */
function reinitialiserGrille(grille: Cellule[][], lignes: number, colonnes: number): void {
    for (let i = 0; i < lignes; i++) {
        for (let j = 0; j < colonnes; j++) {
            grille[i][j].type = Terrains.Ocean;
            grille[i][j].idIle = undefined;
            grille[i][j].estRiviere = undefined;
            grille[i][j].tyrolienne = undefined;
        }
    }
}

// Permet de créer l'aide en ligne de commande et de relier les options à une valeur
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
    .helpOption('-h, --help', 'Affiche l\'aide');

program.showHelpAfterError('(SOS: faire -h pour obtenir de l\'aide)');
program.parse();

const options = program.opts();
console.log(options);

if (options.iles === '1') {
    console.error("[Erreur] - Vous ne pouvez pas avoir une seule île, un minimum de deux est nécessaire !");
    process.exit(1);
}

if (Number(options.plaines) + Number(options.forets) + Number(options.montagnes) > options.lignes * options.colonnes) {
    console.error("[Erreur] - Vous ne pouvez pas avoir plus de tuiles que de cases !");
    process.exit(1);
}

if (Number(options.plaines) + Number(options.forets) + Number(options.montagnes) + Number(options.lignes) + Number(options.colonnes) > options.lignes * options.colonnes) {
    console.error("[Erreur] - Il doit y avoir de l'océan entre les îles !");
    process.exit(1);
}

if (options.tyroliennes > options.lignes * options.colonnes || options.longueur_rivieres > options.lignes * options.colonnes) {
    console.error("[Erreur] - Il ne peut pas y avoir plus de tuiles spéciales que de cases !");
}

const grille: Cellule[][] = [];

for (let i = 0; i < options.lignes; i++) {
    grille.push([]);
    for (let j = 0; j < options.colonnes; j++) {
        grille[i].push({x: j, y: i, type: Terrains.Ocean});
    }
}

let carteReussie = false;
let tentativesCarteComplete = 0;
let repartition = repartirTerrainsParIle(options);

console.log("\n=== GÉNÉRATION DES ÎLES ===");

while (!carteReussie) {
    tentativesCarteComplete++;

    if (tentativesCarteComplete > 1) {
        console.log(`\n NOUVELLE RÉPARTITION - Tentative ${tentativesCarteComplete} pour générer la carte complète...\n`);
        reinitialiserGrille(grille, options.lignes, options.colonnes);
        repartition = repartirTerrainsParIle(options);
    }

    console.log("\n Répartition des terrains pour cette tentative:");
    for (let i = 0; i < options.iles; i++) {
        console.log(`  Île ${i + 1}: P=${repartition.plaines[i]}, F=${repartition.forets[i]}, M=${repartition.montagnes[i]} | MF=${repartition.massifsForet[i]}, MM=${repartition.massifsMontagne[i]}`);
    }

    const idsIlesGenerees: number[] = [];
    let toutesIlesReussies = true;

    for (let i = 0; i < options.iles; i++) {
        console.log(`\n Île ${i + 1}:`);
        console.log(`  Plaines: ${repartition.plaines[i]}, Forêts: ${repartition.forets[i]}, Montagnes: ${repartition.montagnes[i]}`);
        console.log(`  Massifs forêt: ${repartition.massifsForet[i]}, Massifs montagne: ${repartition.massifsMontagne[i]}`);

        let tentativesIle = 0;
        let success = false;
        let idIleActuelle: number | undefined;
        const maxTentatives = 10;

        while (!success && tentativesIle < maxTentatives) {
            if (tentativesIle > 0) {
                console.log(`Tentative ${tentativesIle + 1}/${maxTentatives} pour l'île ${i + 1}...`);
            }

            // Générer un nouvel ID unique pour cette tentative
            idIleActuelle = Math.floor(Math.random() * 1000000) + Date.now() + tentativesIle + i * 10000;

            success = generationIleAvecId(
                options,
                grille,
                repartition.plaines[i],
                repartition.forets[i],
                repartition.montagnes[i],
                repartition.massifsForet[i],
                repartition.massifsMontagne[i],
                idIleActuelle
            );

            if (!success && idIleActuelle !== undefined) {
                // Nettoyer l'île ratée avec son ID spécifique
                console.log(`Génération échouée, nettoyage de l'île ${idIleActuelle}...`);
                nettoyerIle(grille, idIleActuelle);
            }

            tentativesIle++;
        }

        if (!success) {
            console.warn(`Impossible de générer l'île ${i + 1} après ${maxTentatives} tentatives`);
            console.log('Nouvelle répartition des terrains nécessaire...');
            toutesIlesReussies = false;
            break; // Sortir de la boucle des îles pour remélanger
        } else {
            console.log(`Île ${i + 1} générée avec succès !`);
            if (idIleActuelle !== undefined) {
                idsIlesGenerees.push(idIleActuelle);
            }
        }
    }

    if (toutesIlesReussies) {
        carteReussie = true;
        console.log(`\nCarte complète générée avec succès après ${tentativesCarteComplete} répartition(s) ! Youpi !`);
    }
}

console.log(grille);