import Grille from "./components/Grille";
import carte from './temp.json';

export default function Home() {
    return (
        <>
            <Grille rayon={40} carte={carte} />
        </>
    );
}