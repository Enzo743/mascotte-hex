// Dépendances
import { CarteJSON, Contexte} from "./Interfaces";
import { TraitementTotal } from "./Traitement";
import carteBrute from "./carte.json" assert {type: "json"};
const carteJSON: CarteJSON = carteBrute as CarteJSON;

export default function Home() {
    const rayon: number = 60;
    const contexte: Contexte = TraitementTotal(carteJSON, rayon);

    // Pas eu le temps d'implémenter la Grille
    return (
        <>

        </>
    );
}