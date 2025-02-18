import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NGOList from "./pages/NGOList";
import SupermarketList from "./pages/SupermarketList";
import StudentList from "./pages/StudentList";
import TransporterList from "./pages/TransporterList";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipients/ngos" element={<NGOList />} />
        <Route path="/donors/supermarkets" element={<SupermarketList />} />
        <Route path="/recipients/students" element={<StudentList />} />
        <Route path="/transporters" element={<TransporterList />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
