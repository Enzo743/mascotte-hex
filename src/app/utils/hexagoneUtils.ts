import {Case} from "@/app/components/Structure";

// Fonction qui donne toutes les cases adjacentes à une case passée en paramètre
export function getVoisins(caseActuelle: Case, hexagones: Case[]): Case[] {
    const voisins: Case[] = [];

    // Extraire les coordonnées logiques depuis l'ID (format "q-r")
    const [q, r]: number[] = caseActuelle.id.split("-").map(Number);

    // Les 6 directions pour un hexagone en coordonnées axiales
    const directions: number[][] = [
        [1, 0],   // Droite
        [0, -1],  // Haut-droite
        [-1, -1],  // Haut-gauche
        [-1, 0],  // Gauche
        [-1, 1],  // Bas-gauche
        [0, 1]    // Bas-droite
    ];

    // Pour chaque direction, vérifier si le voisin existe
    for (const [dq, dr] of directions) {
        const idVoisin: string = `${q + dq}-${r + dr}`;
        const voisin: Case | undefined = hexagones.find((h: Case) => h.id === idVoisin);

        if (voisin) {
            voisins.push(voisin);
        }
    }

    return voisins;
}

// Fonction pour interpoler entre deux hexagones et retourner toutes les cases traversées
export function getHexagonesEntreDeuxPoints(pointA: [number, number], pointB: [number, number], hexagones: Case[]): Case[] {
    const [q1, r1]: [number, number] = pointA;
    const [q2, r2]: [number, number] = pointB;

    // Calculer la distance (nombre d'étapes)
    const distance: number = Math.max(
        Math.abs(q2 - q1),
        Math.abs(r2 - r1),
        Math.abs((q2 + r2) - (q1 + r1))
    );

    const casesTraversees: Case[] = [];

    // Interpoler pour chaque étape
    for (let i: number = 0; i <= distance; i++) {
        const t: number = distance === 0 ? 0 : i / distance;

        // Interpolation linéaire
        const q: number = Math.round(q1 + (q2 - q1) * t);
        const r: number = Math.round(r1 + (r2 - r1) * t);

        const caseId: string = `${q}-${r}`;
        const caseActuelle: Case | undefined = hexagones.find((h: Case) => h.id === caseId);

        if (caseActuelle && !casesTraversees.find((c: Case) => c.id === caseId)) {
            casesTraversees.push(caseActuelle);
        }
    }

    return casesTraversees;
}