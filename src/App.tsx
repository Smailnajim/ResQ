import { Route, Routes } from "react-router-dom";
import Index from "./components/4_layouts";
import Test from "./components/3_Modules/Test";


function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Index/>}>
        <Route index element={<Test/>}/>
        {/* <Route path="map" element={</>}/> */}
        {/* <Route path="fleet" element={</>}/> */}
        {/* <Route path="incidents" element={</>}/> */}
      </Route>
    </Routes>
    </>
  );
}

export default App
