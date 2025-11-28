import { Outlet } from "react-router-dom";
import NavBar from "../2_Widgets/navbar";

export default function Index(){
    return(
    <>
        <NavBar/>
        <main className="max-w-7xl mx-auto p-4">
            <Outlet/>
        </main>
    </>
    );
}