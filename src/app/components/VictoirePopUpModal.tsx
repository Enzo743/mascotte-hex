import React from "react";

// Interface des différentes propriétés du composant
interface VictoirePopUpModalProps {
    texte: string;
    button: boolean;
    buttonLabel: string;
    onClickButton: () => void;
    sndButton: boolean;
    sndButtonLabel: string;
    onClickSndButton: () => void;
}

const VictoirePopUpModal: React.FC<VictoirePopUpModalProps> = ({
                                                               texte,
                                                               button,
                                                               buttonLabel,
                                                               onClickButton,
                                                               sndButton,
                                                               sndButtonLabel,
                                                               onClickSndButton,
                                                           }) => {

    // Modal qui permet d'afficher un message de victoire avec des éléments paramétrables
    return (
        <dialog open>
            <article>
                <h1 className={"texte-victoire-modal"}>{texte}</h1>
                {button && sndButton &&
                    <div className={"buttons-victoire-modal"}>
                        <button type="button"
                                onClick={onClickButton}>{buttonLabel}</button>
                        <button type="button" onClick={onClickSndButton}>{sndButtonLabel}</button>
                    </div>}
            </article>
        </dialog>
    )
}

export default VictoirePopUpModal;