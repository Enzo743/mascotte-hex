import React from "react";
import Link from "next/link";


interface LigneGestionnaireProps {
    nomFichier : string;
    lignes : number;
    colonnes : number;
    href : string;
}

const LigneGestionnaire: React.FC<LigneGestionnaireProps> = ({
                                                                nomFichier,
                                                                lignes,
                                                                colonnes,
                                                                href
                                                            }) => {
    return (
        <div className="ligne-gestionnaire">
            <span className="col-nom">
                <Link href={href}>{nomFichier}</Link>
            </span>

            <span className="col-infos">
                <span className="col-lignes">{lignes}</span>
                <span className="col-colonnes">{colonnes}</span>
            </span>
            
        </div>
    );
}

export default LigneGestionnaire;
                                                            