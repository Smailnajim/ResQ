
export default function Button({label, onClick}: {label: string, onClick?: ()=>void}){
    return (
        <button 
        className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition" 
        onClick={onClick}>
            {label}
        </button>
    );
}