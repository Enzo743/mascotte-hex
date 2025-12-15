import "../../globals.css";
import {IconType} from "react-icons";

interface CategorieProps {
    icon: IconType;
    label: string;
    className: string;
    onClick: () => void;
    secondaryButton?: boolean;
    secondaryState?: boolean;
    onSecondaryClick?: () => void;
}

const Categorie: React.FC<CategorieProps> = ({
                                                 icon: Icon,
                                                 label,
                                                 className,
                                                 onClick,
                                                 secondaryButton,
                                                 secondaryState,
                                                 onSecondaryClick
                                             }) => {
    return (
        <div className={`${className} categorie-container`}>
            <div className={'categorie-main'} onClick={onClick}>
                <Icon size={30}/>
                <p>{label}</p>
            </div>

            {secondaryButton && (
                <button
                    className={`mode-button ${secondaryState ? 'mode-add' : 'mode-remove'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSecondaryClick?.();
                    }}
                    title={secondaryState ? "Mode ajout" : "Mode suppression"}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                    {secondaryState ? "+" : "-"}
                </button>
            )}
        </div>
    );
};

export default Categorie;