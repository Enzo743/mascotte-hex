"use client";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from 'next/navigation';
import slugify from 'slugify';

export default function NouveauPopUpModal()
{
    const ligne_ref = useRef<HTMLFormElement>(null);
    const colonne_ref = useRef<HTMLFormElement>(null);
    const nom_ref = useRef<HTMLFormElement>(null);
    const router = useRouter();

    async function envoiFormulaire(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("lignes", ligne_ref.current?.value);
        formData.append("colonnes", colonne_ref.current?.value);
        const nom_ref_slug = slugify(nom_ref.current?.value, '_');
        formData.append("nom", nom_ref_slug);

        const reponse = await fetch("/api/cartes", {
            method: "POST",
            body: formData,
        });

        const resultat = await reponse.json();
        console.log(resultat);

        router.push(`/editeur/modifier?id=${nom_ref_slug}`);
    }

    return (
        <dialog open>
            <article>
                <header>
                    <Link href="/editeur" aria-label="Close" className="close" style={{ float: 'right', marginTop: '5px' }}/>
                    <h3 style={{ textAlign: 'center', margin: 0 }}>Nouvelle carte</h3>
                </header>
                <form>
                    <label htmlFor="nom">Nom du fichier :</label>
                    <input id="nom" type="text" name="nom" ref={nom_ref} required/>

                    <label htmlFor="ligne">Nombre de lignes souhaitées :</label>
                    <input id="ligne" type="number" name="ligne" ref={ligne_ref} required/>

                    <label htmlFor="colonne">Nombre de colonnes souhaitées :</label>
                    <input id="colonne" type="number" name="colonne" ref={colonne_ref} required/>

                    <button type="submit" onClick={envoiFormulaire}>Valider</button>
                </form>
            
                
            </article>
            
        </dialog>
    );
};

