"use client";
import Link from "next/link";
import {FormEvent, useRef} from "react";
import {useRouter, useSearchParams} from 'next/navigation';
import slugify from 'slugify';
import ErreurPopUpModal from "@/app/components/editeur/modals/ErreurPopUpModal";

export default function NouveauPopUpModal() {
    // Références aux éléments du formulaire
    const ligne_ref = useRef<HTMLFormElement>(null);
    const colonne_ref = useRef<HTMLFormElement>(null);
    const nom_ref = useRef<HTMLFormElement>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const showErreur = searchParams.get("showErreur");

    // Fonction qui permet l'envoi des données sur le serveur
    async function envoiDonnees(data: FormData, nom_ref_slug: string) {
        const reponse = await fetch("/api/cartes", {
            method: "POST",
            body: data,
        });

        const resultat = await reponse.json();
        console.log(resultat);

        router.push(`/editeur/modifier?id=${nom_ref_slug}`);
    }

    // Fonction qui permet de faire la validation du formulaire
    async function traiterFormulaire(force: boolean) {
        const valLignes = ligne_ref.current?.value;
        const valColonnes = colonne_ref.current?.value;
        const valNom = nom_ref.current?.value;

        const formData = new FormData();
        formData.append("lignes", valLignes);
        formData.append("colonnes", valColonnes);

        const nom_ref_slug = slugify(valNom, {replacement: '_', remove: /[*+~.()'"!:@]/g});
        formData.append("nom", nom_ref_slug);

        if (force) {
            await envoiDonnees(formData, nom_ref_slug);
            return;
        }

        const noms = await fetch("/api/cartes/noms", {method: "GET"});
        const resultatNoms = await noms.json();
        console.log(resultatNoms);

        if (resultatNoms.find((nom: { nom: string; }) => nom.nom === nom_ref_slug)) {
            router.push("/editeur?show=true&showErreur=true");
        } else {
            await envoiDonnees(formData, nom_ref_slug);
        }
    }

    // Fonction qui est reliée au clic du bouton du formulaire
    async function onFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await traiterFormulaire(false);
    }

    // Modal qui permet d'afficher le formulaire de création de carte
    return (
        <>
            <dialog open>
                <article>
                    <header>
                        <Link href="/editeur" aria-label="Close" className="close link-message-modal"/>
                        <h3 className={"titre-message-modal"}>Nouvelle carte</h3>
                    </header>
                    <form onSubmit={onFormSubmit}>
                        <label htmlFor="nom">Nom du fichier :</label>
                        <input id="nom" type="text" name="nom" ref={nom_ref} required/>

                        <label htmlFor="ligne">Nombre de lignes souhaitées :</label>
                        <input id="ligne" type="number" name="ligne" ref={ligne_ref} required/>

                        <label htmlFor="colonne">Nombre de colonnes souhaitées :</label>
                        <input id="colonne" type="number" name="colonne" ref={colonne_ref} required/>

                        <button type="submit">Valider</button>
                    </form>
                </article>
            </dialog>

            {/* Si un appel est déclanché à la modal d'erreur, on la créée ici */}
            {showErreur && <ErreurPopUpModal
                titre={"Erreur"}
                description={"Le nom que vous avez passé existe déjà ! Voulez-vous toujours créer une nouvelle carte, cela écrasera l'ancienne carte ?"}
                onClickButton={() => router.push("/editeur?show=true")}
                sndButton={true}
                sndButtonLabel={"Oui"}
                onClickSndButton={() => traiterFormulaire(true)}
            />}
        </>
    );
};

