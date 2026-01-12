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

function floodFillHexagonale(grille: Cellule[][], caseDepart: Cellule, type: TerrainType, tailleMax: number): void {
    const file: Cellule[] = [caseDepart];
    let taille: number = 0;

    while (file.length > 0 && taille < tailleMax) {
        const caseSelec: Cellule[] = file.splice(0, 1);
        const cx: number = caseSelec[0].x;
        const cy: number = caseSelec[0].y;

        if (grille[cy][cx].type === Terrains.Plaine) {
            grille[cy][cx].type = type;
            taille++;

            getVoisins(grille, caseSelec[0]).forEach((h: Cellule) => {
                if (Math.random() > 0.5 && grille[h.y][h.x].type === Terrains.Plaine && h.idIle === caseDepart.idIle) {
                    file.push(h);
                }
            });
        }
    }
}

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

const tabPlaines: number[] = [];
const tabForets: number[] = [];
const tabMontagnes: number[] = [];
const tabMassifsMontagne: number[] = [];
const tabMassifsForet: number[] = [];

for (let i = 0; i < options.iles; i++) {
    const nbPlaines: number = Math.floor(Math.random() * (options.plaines / options.iles)) + Math.floor(options.plaines / options.iles / 1.9);
    const nbForets: number = Math.floor(Math.random() * (options.forets / options.iles)) + Math.floor(options.forets / options.iles / 1.9);
    const nbMontagnes: number = Math.floor(Math.random() * (options.montagnes / options.iles)) + Math.floor(options.montagnes / options.iles / 1.9);
    const massifsMontagne: number = Math.floor(Math.random() * (options.massifs_montagne / options.iles)) + Math.floor(options.massifs_montagne / options.iles / 1.9);
    const massifsForet: number = Math.floor(Math.random() * (options.massifs_foret / options.iles)) + Math.floor(options.massifs_foret / options.iles / 1.9);

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
bonNombreDeTuiles(options.massifs_montagne, sumTabMassifsMontagne, tabMassifsMontagne);

const sumTabMassifsForet: number = tabMassifsForet.reduce((a: number, b: number): number => a + b, 0);
bonNombreDeTuiles(options.massifs_foret, sumTabMassifsForet, tabMassifsForet);

for (let i = 0; i < options.iles; i++) {
    generationIle(options, grille, tabPlaines[i] + tabMontagnes[i] + tabForets[i], tabMassifsForet[i], tabForets[i], tabMassifsMontagne[i], tabMontagnes[i]);
}

console.log(grille);