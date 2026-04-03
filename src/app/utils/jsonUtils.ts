// Fonction qui permet de voir si deux tuiles sont identiques (en JSON)
import {CarteJSON, Connexion} from "@/app/modules/Interfaces";

export function estMemeTuile(t1: [number, number], t2: [number, number]): boolean {
    return JSON.stringify(t1) === JSON.stringify(t2);
}

// Fonction qui permet de retirer des terrains s'ils sont déjà présents dans le JSON
export function retirerDesTerrainsSiPresent(json: CarteJSON, tuile: [number, number]): void {
    const {terrains} = json;
    if (!terrains) return;

    const indexMontagne: number = terrains.montagne?.findIndex((t: [number, number]): boolean => estMemeTuile(t, tuile)) ?? -1;
    if (indexMontagne !== -1) terrains.montagne.splice(indexMontagne, 1);

    const indexForet: number = terrains.foret?.findIndex((t: [number, number]): boolean => estMemeTuile(t, tuile)) ?? -1;
    if (indexForet !== -1) terrains.foret.splice(indexForet, 1);

    const indexPlaine: number = terrains.plaine?.findIndex((t: [number, number]): boolean => estMemeTuile(t, tuile)) ?? -1;
    if (indexPlaine !== -1) terrains.plaine.splice(indexPlaine, 1);
}

// Fonction qui permet de vérifier les conflits dans le fichier JSON sur les connexions
export function estEnConflit(connexion: Connexion, typeConnexion: [number, number][]): boolean {
    return connexion.tuiles.some((tuileRiviere: [number, number]) =>
        (typeConnexion as [number, number][]).some((tuileTyro: [number, number]): boolean =>
            JSON.stringify(tuileRiviere) === JSON.stringify(tuileTyro) ||
            JSON.stringify(tuileRiviere) === JSON.stringify([...tuileTyro].reverse())
        )
    );
}