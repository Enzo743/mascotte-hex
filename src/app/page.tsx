import Grille from "./components/Grille";
import carte1 from './carte1.json';

export default function Home() {
    return (
        <>
            <Grille rayon={40} carte={carte1} />
        </>
    );
}