import { Navigate, Route, Routes } from "react-router-dom";
import Index from "./components/4_layouts";
import CalendarDemo from "./components/3_Modules/Test";
import Map from "./pages/map";
import Incidents from "./pages/incidents";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />}>
          <Route index element={<CalendarDemo />} />
          <Route path="map" element={<Map />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App

