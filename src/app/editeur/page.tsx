"use client";
import Link from "next/link";
import {useSearchParams} from 'next/navigation';
import NouveauPopUpModal from "../components/editeur/modals/NouveauPopUpModal";
import "../globals.css";
import GestionnaireModal from "../components/editeur/modals/GestionnaireModal";

export default function Page() {
    const searchParams = useSearchParams();
    const show = searchParams.get("show");
    const showVisualisation = searchParams.get("showVisu");
    const showModification = searchParams.get("showModif");

    return (
        <main className="container">
            <header className={"head"}>
                <h1 className={"titre-head"}>Editeur de cartes Mascotte Hex</h1>
                <p className={"text-head"}>Bienvenue sur l&#39;éditeur de cartes du jeu Mascotte Hex. Vous pouvez créer
                    une nouvelle carte, en visualiser une pour voir si elle vous plait, ou modifier une carte
                    existante.</p>
            </header>
            <div className={"grid"}>
                <Link id="btnNouveau" href="/editeur?show=true" role="button">Nouveau</Link>
                <Link id="btnVisualiser" href="/editeur?showVisu=true" role="button">Visualiser</Link>
                <Link id="btnModifier" href="/editeur?showModif=true" role="button">Modifier</Link>
            </div>

            {show && <NouveauPopUpModal/>}
            {showVisualisation && <GestionnaireModal prefixe="/editeur/visualiser" onCloseHref={"/editeur"}/>}
            {showModification && <GestionnaireModal prefixe="/editeur/modifier" onCloseHref={"/editeur"}/>}
        </main>
    );
};