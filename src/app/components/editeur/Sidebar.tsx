import Categorie from "@/app/components/editeur/Categorie";
import {IoIosArrowForward} from "react-icons/io";
import {LuFlower, LuMountain, LuWaves} from "react-icons/lu";
import {MdOutlineForest} from "react-icons/md";
import {GiBroccoli, GiCarabiner, GiPenguin, GiRiver} from "react-icons/gi";
import {HiOutlineSave} from "react-icons/hi";
import {TbZoom} from "react-icons/tb";
import {useState} from "react";

interface SidebarProps {
    carteId: string | null;
    rayon: number;
    setRayon: (rayon: number) => void;
    terrainSelectionne: string | null;
    residenceSelectionnee: string | null;
    connexionsSelectionnee: string | null;
    selectionner: (mode: "terrain" | "residence" | "connexion", valeur: string | null) => void
    estTerrainOuvert: boolean;
    setEstTerrainOuvert: (estTerrainOuvert: boolean) => void;
    estResidenceOuverte: boolean;
    setEstResidenceOuverte: (estResidenceOuverte: boolean) => void;
    estConnexionsOuverte: boolean;
    setEstConnexionsOuverte: (estConnexionsOuverte: boolean) => void;
    onChangerCarte: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
                                             carteId,
                                             rayon,
                                             setRayon,
                                             terrainSelectionne,
                                             residenceSelectionnee,
                                             connexionsSelectionnee,
                                             selectionner,
                                             estTerrainOuvert,
                                             setEstTerrainOuvert,
                                             estResidenceOuverte,
                                             setEstResidenceOuverte,
                                             estConnexionsOuverte,
                                             setEstConnexionsOuverte,
                                             onChangerCarte
                                         }) => {
    // State pour gérer le mode ajout et suppression : true pour ajout, et false pour suppression
    const [modeTyrolienne, setModeTyrolienne] = useState(true);
    const [modeRiviere, setModeRiviere] = useState(true);

    return (
        <div className={"sidebar-left"}>
            <h1>
                Edition de la carte &#34;{carteId}&#34;
            </h1>

            {/* Onglet du terrain */}
            <Categorie
                icon={IoIosArrowForward} label={"Terrain"}
                className={`menu-item ${estTerrainOuvert ? "open" : ""}`}
                onClick={() => setEstTerrainOuvert(!estTerrainOuvert)}/>

            {/* Contenu présent quand on clique sur l'onglet du terrain */}
            {estTerrainOuvert && (
                <div className={"sousCat"}>
                    <Categorie icon={LuFlower} label={"Plaine"}
                               className={`menu-item ${terrainSelectionne === "plaine" ? "active" : ""}`}
                               onClick={() => selectionner("terrain", terrainSelectionne === "plaine" ? null : "plaine")}/>
                    <Categorie icon={MdOutlineForest} label={"Forêt"}
                               className={`menu-item ${terrainSelectionne === "foret" ? "active" : ""}`}
                               onClick={() => selectionner("terrain", terrainSelectionne === "foret" ? null : "foret")}/>
                    <Categorie icon={LuMountain} label={"Montagne"}
                               className={`menu-item ${terrainSelectionne === "montagne" ? "active" : ""}`}
                               onClick={() => selectionner("terrain", terrainSelectionne === "montagne" ? null : "montagne")}/>
                    <Categorie icon={LuWaves} label={"Océan"}
                               className={`menu-item ${terrainSelectionne === "ocean" ? "active" : ""}`}
                               onClick={() => selectionner("terrain", terrainSelectionne === "ocean" ? null : "ocean")}/>
                </div>
            )}

            {/* Onglet des résidences */}
            <Categorie icon={IoIosArrowForward} label={"Résidences"}
                       className={`menu-item ${estResidenceOuverte ? "open" : ""}`}
                       onClick={() => setEstResidenceOuverte(!estResidenceOuverte)}/>

            {/* Contenu présent quand on clique sur l'onglet des résidences */}
            {estResidenceOuverte && (
                <div className={"sousCat"}>
                    <Categorie icon={GiPenguin} label={"Résidence des informaticiens"}
                               className={`menu-item ${residenceSelectionnee === "info" ? "active" : ""}`}
                               onClick={() => selectionner("residence", residenceSelectionnee === "info" ? null : "info")}/>
                    <Categorie icon={GiBroccoli} label={"Résidence des biologistes"}
                               className={`menu-item ${residenceSelectionnee === "bio" ? "active" : ""}`}
                               onClick={() => selectionner("residence", residenceSelectionnee === "bio" ? null : "bio")}/>
                </div>
            )}

            {/* Onglet des connexions */}
            <Categorie icon={IoIosArrowForward} label={"Connexions"}
                       className={`menu-item ${estConnexionsOuverte ? "open" : ""}`}
                       onClick={() => setEstConnexionsOuverte(!estConnexionsOuverte)}/>

            {/* Contenu présent quand on clique sur l'onglet des connexions */}
            {estConnexionsOuverte && (
                <div className={"sousCat"}>
                    <Categorie icon={GiCarabiner} label={"Tyrolienne"}
                               className={`menu-item ${connexionsSelectionnee === "tyrolienne" ? "active" : ""}`}
                               onClick={() => selectionner("connexion", connexionsSelectionnee === "tyrolienne" ? null : "tyrolienne")}
                               secondaryButton={true}
                               secondaryState={modeTyrolienne}
                               onSecondaryClick={() => setModeTyrolienne(!modeTyrolienne)}/>
                    <Categorie icon={GiRiver} label={"Rivière"}
                               className={`menu-item ${connexionsSelectionnee === "riviere" ? "active" : ""}`}
                               onClick={() => selectionner("connexion", connexionsSelectionnee === "riviere" ? null : "riviere")}
                               secondaryButton={true}
                               secondaryState={modeRiviere}
                               onSecondaryClick={() => setModeRiviere(!modeRiviere)}/>
                </div>
            )}

            {/* Onglet pour changer de carte */}
            <Categorie icon={HiOutlineSave} label={"Changer de carte"}
                       className={"menu-item"}
                       onClick={onChangerCarte}/>

            {/* Slider pour gérer le zoom de la carte */}
            <form className="zoom-form menu-item">
                <label className="zoom-row">
                            <span className="zoom-icon">
                                <TbZoom size={30}/>
                            </span>

                    <input
                        className="zoom-range"
                        type={"range"}
                        min={20}
                        max={65}
                        step={1}
                        value={rayon}
                        onChange={(e) => setRayon(Number(e.currentTarget.value))}
                    />

                    <span className="zoom-value">{rayon}</span>
                </label>
            </form>
        </div>
    )
}

export default Sidebar;