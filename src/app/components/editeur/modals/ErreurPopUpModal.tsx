import React from "react";

// Interface des différentes propriétés du composant
interface ErreurPopUpModalProps {
    titre: string;
    description: string;
    onClickButton: () => void;
    sndButton?: boolean;
    sndButtonLabel?: string;
    onClickSndButton?: () => void;
}

const ErreurPopUpModal: React.FC<ErreurPopUpModalProps> = ({
                                                               titre,
                                                               description,
                                                               onClickButton,
                                                               sndButton,
                                                               sndButtonLabel,
                                                               onClickSndButton,
                                                           }) => {

    // Modal qui permet d'afficher un message d'erreur avec des éléments paramétrables et optionnels
    return (
        <dialog open>
            <article>
                <header>
                    <h3 className={"titre-erreur-modal"}>{titre}</h3>
                </header>
                <p className={"text-erreur-modal"}>{description}</p>
                {sndButton &&
                    <div className={"buttons-erreur-modal"}>
                        <button type="button"
                                onClick={onClickSndButton}>{sndButtonLabel}</button>
                        <button type={"button"} className={"button-red-modal"} onClick={onClickButton}>Annuler</button>
                    </div>}
            </article>
        </dialog>
    )
}

export default ErreurPopUpModal;