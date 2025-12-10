"use client";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import NouveauPopUpModal from "../components/editeur/NouveauPopUpModal";

export default function Title() {
    const searchParams = useSearchParams();

    const show = searchParams.get("show");

    return (
        <main className="container">
            <header style={{ marginBottom: "2rem" }}>
                <h1>Editeur du jeu</h1>
                <p>Paragraphe explicatif</p>
            </header>
            <div className="grid">
                <Link id="btnNouveau" href="editeur?show=true" role="button">Nouveau</Link>
                <button id="btnVisualiser">Visualiser</button>
                <button id="btnModifier">Modifier</button>
            </div>

            {show && <NouveauPopUpModal />}
        </main>

        
);};