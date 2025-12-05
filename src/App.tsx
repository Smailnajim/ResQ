import { Navigate, Route, Routes } from "react-router-dom";
import Index from "./components/4_layouts";
import CalendarDemo from "./components/3_Modules/Test";
import Map from "./pages/map";


function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Index/>}>
        <Route index element={<CalendarDemo/>}/>
        <Route path="map" element={<Map/>}/>
        <Route path="*" element={<Navigate to="/" />}/>
        {/* <Route path="map" element={</>}/> */}
        {/* <Route path="fleet" element={</>}/> */}
        {/* <Route path="incidents" element={</>}/> */}
      </Route>
    </Routes>
    </>
  );
}

export default App
