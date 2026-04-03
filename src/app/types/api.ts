import {CarteJSON} from "@/app/modules/Interfaces";

export interface APITuileCollection {
    nom: string;
    info?: string;
    bio?: string;
    montagne?: number;
    foret?: number;
    ocean?: number;
    plaine?: number;
    tyrolienne?: number;
    riviere?: number;
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