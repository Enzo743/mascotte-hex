import {useCallback, useState} from 'react';

interface HistoriqueState {
    jsonData: any;
    timestamp: number;
}

export function useHistorique(maxHistoriqueTaille: number = 20) {
    const [historique, setHistorique] = useState<HistoriqueState[]>([]);
    const [indexCourant, setIndexCourant] = useState<number>(-1);

    // Sauvegarder un nouvel état (Action effectuée)
    const sauvegarderState = useCallback((jsonData: any) => {
        setHistorique(prev => {
            const baseHistorique = prev.slice(0, indexCourant + 1);

            const nouvelEtat = {
                jsonData: JSON.parse(JSON.stringify(jsonData)), // Copie profonde
                timestamp: Date.now()
            };

            const nouveauHistorique = [...baseHistorique, nouvelEtat];

            if (nouveauHistorique.length > maxHistoriqueTaille) {
                const tronque = nouveauHistorique.slice(nouveauHistorique.length - maxHistoriqueTaille);
                setIndexCourant(tronque.length - 1);
                return tronque;
            }

            setIndexCourant(nouveauHistorique.length - 1);
            return nouveauHistorique;
        });
    }, [indexCourant, maxHistoriqueTaille]);

    // Undo : Recule l'index et renvoie l'état correspondant
    const undo = useCallback((): any | null => {
        if (indexCourant > 0) {
            const nouvelIndex = indexCourant - 1;
            setIndexCourant(nouvelIndex);
            return historique[nouvelIndex].jsonData;
        }
        return null;
    }, [indexCourant, historique]);

    // Redo : Avance l'index et renvoie l'état correspondant
    const redo = useCallback((): any | null => {
        if (indexCourant < historique.length - 1) {
            const nouvelIndex = indexCourant + 1;
            setIndexCourant(nouvelIndex);
            return historique[nouvelIndex].jsonData;
        }
        return null;
    }, [indexCourant, historique]);

    // Logique stricte des boutons
    const peutUndo = historique.length > 0 && indexCourant > 0;
    const peutRedo = historique.length > 0 && indexCourant < historique.length - 1;

    const effacerHistorique = useCallback(() => {
        setHistorique([]);
        setIndexCourant(-1);
    }, []);

    return {
        sauvegarderState,
        undo,
        redo,
        peutUndo,
        peutRedo,
        effacerHistorique,
        historiqueTaille: historique.length,
        indexCourant
    };
}