import {CarteJSON} from "@/app/modules/Interfaces";

export interface APITuileCollection {
    nom: string;
    info?: string | [number, number];
    bio?: string | [number, number];
    montagne?: number | [number, number];
    foret?: number | [number, number];
    ocean?: number | [number, number];
    plaine?: number | [number, number];
    tyrolienne?: number | [number, number][];
    riviere?: number | [number, number][];
}

export interface APINom {
    nom: string;
    lignes: number;
    colonnes: number
}

export interface APIRemplacerCarte {
    nom: string;
    data: CarteJSON | null;
}

export interface APIRiviere {
    nom: string;
    tuile: [number, number];
}

export interface APISuppressionTuile {
    nom: string;
    type: string;
    tuileSupprimee: [number, number];
}