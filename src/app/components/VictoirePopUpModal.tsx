import React from "react";

// Interface des différentes propriétés du composant
interface VictoirePopUpModalProps {
    titre: string;
    texte: string;
    onClickFermeture: () => void;
    button: boolean;
    buttonLabel: string;
    onClickButton: () => void;
}

const VictoirePopUpModal: React.FC<VictoirePopUpModalProps> = ({
                                                               titre,
                                                               texte,
                                                               onClickFermeture,
                                                               button,
                                                               buttonLabel,
                                                               onClickButton,
                                                           }) => {

    // Modal qui permet d'afficher un message de victoire avec des éléments paramétrables
    return (
        <dialog open>
            <article>
                <header>
                    <h1 className={"texte-victoire-modal"}>{titre}</h1>
                    <button className={"button-fermeture-modal"}
                            aria-label = "Close"
                            rel = "prev"
                            onClick={onClickFermeture}
                        />
                </header>
                <p className="texte-victoire-modal">{texte}</p>
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