import { Link } from "react-router-dom";
import Li from "../1_atoms/Li";

export default function NavBar(){

    return(
        <ul className="w-full bg-white shadow-sm px-6 py-3 flex items-center gap-4 border-b">
            <Li> <Link to="/">Home</Link>  </Li>
            <Li> <Link to="/map">map</Link>  </Li>
            <Li> <Link to="/fleet">fleet</Link>  </Li>
            <Li> <Link to="/incidents">incidents</Link>  </Li>
        </ul>
    );
}