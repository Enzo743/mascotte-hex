import {Carte, Case, Connexion} from "@/app/components/Structure";
import {Terrain} from "@/app/components/Terrain";
import {useEffect, useState} from "react";
import {LogMessage} from "@/app/components/editeur/LogTextarea";
import {getCarte} from "@/app/actions/getCarte";

export function useEditeurCarte(carteId: string | null, rayon: number) {
    // States relatifs à la carte
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [hexagones, setHexagones] = useState<Case[]>([]);
    const [tyroliennes, setTyroliennes] = useState<Connexion[]>([]);
    const [rivieres, setRivieres] = useState<Connexion[]>([]);
    const [posInfo, setPosInfo] = useState<Case | null>(null);
    const [posBio, setPosBio] = useState<Case | null>(null);
    const [jsonData, setJsonData] = useState<Carte | null>(null);

    // State relatif aux logs
    const [messages, setMessages] = useState<LogMessage[]>([]);

    // Fonction qui permet de mettre des messages dans la textarea
    const pushMsg = (text: string, level: LogMessage["level"] = "ok"): void => {
        setMessages((prev) =>
            [...prev, {id: crypto.randomUUID(), text, level}].slice(-50)
        );
    };

    // Fonction qui permet de recharger la carte avec les changements effectués
    const appliquerCarte = (json: Carte, rayon: number): void => {
        setIsLoaded(true);

        const nextHexagones: Case[] = Terrain(json, rayon) as Case[];
        setHexagones(nextHexagones);

        const info: number[] | null = json.résidences?.info ?? null;
        const bio: number[] | null = json.résidences?.bio ?? null;

        // On transforme [x,y] -> "x-y" pour comparer simplement
        const infoId: string | null = info ? `${info[0]}-${info[1]}` : null;
        const bioId: string | null = bio ? `${bio[0]}-${bio[1]}` : null;

        setPosInfo(infoId ? (nextHexagones.find((h: Case) => h.id === infoId) ?? null) : null);
        setPosBio(bioId ? (nextHexagones.find((h: Case) => h.id === bioId) ?? null) : null);

        const connexions: Connexion[] = json.connexions ?? [];
        setTyroliennes(connexions.filter((c: Connexion) => c.type === "tyrolienne"));
        setRivieres(connexions.filter((c: Connexion) => c.type === "riviere"));
    };

    // Permet le chargement de la carte
    useEffect(() => {
        const chargerCarte = async (): Promise<void> => {
            if (!carteId) return;

            const json: any = await getCarte(carteId);
            if (json && !json.error) {
                appliquerCarte(json, rayon);
                setJsonData(json);
            }
        };

        chargerCarte();
    }, [carteId, rayon]);

    // Fonction publique pour recharger la carte manuellement
    const rechargerCarte = async (): Promise<void> => {
        if (!carteId) return;

        const json: any = await getCarte(carteId);
        if (json && !json.error) {
            appliquerCarte(json, rayon);
            setJsonData(json);
        }
    };

    return {
        isLoaded,
        hexagones,
        tyroliennes,
        rivieres,
        posInfo,
        posBio,
        jsonData,
        messages,
        pushMsg,
        rechargerCarte,
        appliquerCarte
    };
}