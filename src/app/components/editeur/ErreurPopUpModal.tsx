import React from "react";
import Link from "next/link";

interface ErreurPopUpModalProps {
    titre: string;
    description: string;
    onCloseRoute: string;
    sndButton?: boolean;
    sndButtonLabel?: string;
    onClickSndButton?: () => void;
}

const ErreurPopUpModal: React.FC<ErreurPopUpModalProps> = ({
                                                               titre,
                                                               description,
                                                               onCloseRoute,
                                                               sndButton,
                                                               sndButtonLabel,
                                                               onClickSndButton,
                                                           }) => {
    return (
        <dialog open>
            <article>
                <header>
                    <Link href={onCloseRoute} aria-label="Close" className="close"
                          style={{float: 'right', marginTop: '5px'}}/>
                    <h3 style={{textAlign: 'center', margin: 0, color: '#D93526'}}>{titre}</h3>
                </header>
                <p>{description}</p>
                {sndButton && <button type="button" onClick={onClickSndButton}>{sndButtonLabel}</button>}
            </article>
        </dialog>
    )
}

export default ErreurPopUpModal;