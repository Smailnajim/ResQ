import { Outlet } from "react-router-dom";
import NavBar from "../3_Modules/NavBar";

export default function Index(){
    return(
    <>
        <NavBar/>
        <main className="max-w-7xl mx-auto px-4">
            <Outlet/>
        </main>
    </>
    );
}