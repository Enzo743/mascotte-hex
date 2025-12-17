import React from "react";

// Interface des différentes propriétés du composant
interface VictoirePopUpModalProps {
    texte: string;
    button: boolean;
    buttonLabel: string;
    onClickButton: () => void;
}

const VictoirePopUpModal: React.FC<VictoirePopUpModalProps> = ({
                                                               texte,
                                                               button,
                                                               buttonLabel,
                                                               onClickButton,
                                                           }) => {

    // Modal qui permet d'afficher un message de victoire avec des éléments paramétrables
    return (
        <dialog open>
            <article>
                <h1 className={"texte-victoire-modal"}>{texte}</h1>
                {button && 
                    <div className={"buttons-victoire-modal"}>
                        <button type="button"
                                onClick={onClickButton}>{buttonLabel}</button>
                    </div>}
            </article>
        </dialog>
    )
}

export default VictoirePopUpModal;