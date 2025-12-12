import "../../globals.css";
import {IconType} from "react-icons";

interface CategorieProps {
    icon: IconType;
    label: string;
    className: string;
    onClick: () => void;
}

const Categorie: React.FC<CategorieProps> = ({icon: Icon, label, className, onClick}) => {
    return (
        <div className={className} onClick={onClick}>
            <Icon size={30}/>
            <p>{label}</p>
        </div>
    );
};

export default Categorie;