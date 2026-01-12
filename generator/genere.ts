import {Command} from 'commander';

const program = new Command();

enum TerrainType {
    OCEAN,
    PLAINE,
    FORET,
    MONTAGNE
}

interface Cellule {
    x: number;
    y: number;
    type: TerrainType;
    islandId?: number;
    massifId?: number;
    hasRiver: boolean;
    tyrolienne: Cellule[]
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