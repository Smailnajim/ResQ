import type { ReactNode } from "react";

export default function Li({children}: {children: ReactNode}){
    return (
        <li className="px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition">
            {children}
        </li>
    );
}